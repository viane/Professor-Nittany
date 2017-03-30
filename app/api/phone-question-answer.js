'use strict'
const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const twilioSMS = require('twilio')('AC986df3d5c5b5185f845ac46499758075', '8953462aa58c2dfaf97835ef40b26fc5');
const loadJsonFile = require('load-json-file');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const fs = require('fs');
const readFile = Promise.promisify(require("fs").readFile);
const request = require('request');
const colors = require('colors');
const questionAnswer = require(appRoot + '/app/question-answer');

const systemErrorMSG = "Sorry there is an issue in system, please try again later or contact us!";

// Watson STT has some issue on recognizing audio file, use Twilio default transcript for now
let speech_to_text;
loadJsonFile(appRoot + '/config/credential.json').then(credential => {
    speech_to_text = new SpeechToTextV1({
        username: credential.speech_to_text.username,
        password: credential.speech_to_text.password,
        headers: {
            'X-Watson-Learning-Opt-Out': 'true'
        }
    });
    console.log("√ Phone QA system: successfully load speech to text service.".green);
});

// store question and answer for user, in order to text them
let QACopyAry = [];

// API for accepting user call in, record voice to twilio server then callback to /api/phone/recording
router.post('/voice-in', (req, res) => {
    const twiml = new twilio.TwimlResponse();
    twiml.say("Hello! Thanks for calling the Intelligent Academic Planer, please go ahead tell me your question and press any key when finished.", {voice: 'alice'});

    // record user question, audio file will be stored in twilio server
    twiml.record({
        maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
        // transcribe: true,
        method: 'POST',
        action: '/api/phone-question-answer/after-record'
    });
    res.send(twiml.toString());
});

// API for after recording, STT the voice record then ask IAP then speak back the result
router.post('/after-record', (req, res) => {
    console.log(req.body);
    const voiceFileWAVUrl = req.body.RecordingUrl.toString().concat(".wav");
    const caller = req.body.From;
    const voiceFileLocalPath = appRoot + '/app/audio-file-temp-folder/' + req.body.RecordingSid + ".wav";
    // fetch audio then read it to Watson STT, temporary disabled
    request(voiceFileWAVUrl).pipe(fs.createWriteStream(voiceFileLocalPath)).on('finish', () => {
        const params = {
            audio: fs.createReadStream(voiceFileLocalPath),
            content_type: 'audio/wav',
            model: 'en-US_NarrowbandModel',
            timestamps: true,
            word_alternatives_threshold: 0.9,
            continuous: true
        };
        const twiml = new twilio.TwimlResponse();
        speech_to_text.recognize(params, function(error, resultTranscript) {
            if (error) {
                console.error(error);
                twiml.say(systemErrorMSG, {voice: 'alice'}).hangup();
                res.send(twiml.toString());
            } else {
                // console.log(JSON.stringify(resultTranscript, null, 2));
                // STT transcript (question body)
                if (resultTranscript.results.length == 0) {
                    twiml.say("Sorry I didn't hear anything", {voice: 'alice'}).pause();
                    twiml.redirect('/api/phone-question-answer/qa-loop');
                    res.send(twiml.toString());
                    return;
                }
                const questionTranscript = resultTranscript.results[0].alternatives[0].transcript;
                // confidence
                const transcriptArruracy = resultTranscript.results[0].alternatives.confidence;
                // if no transcript or low accurate on interpration
                if (!resultTranscript.results[0].alternatives[0].hasOwnProperty('transcript') || transcriptArruracy <= 0.6) {
                    twiml.say("Sorry I not sure what you said of ", {voice: 'alice'});
                    twiml.pause();
                    twiml.say(questionTranscript, {voice: 'alice'});
                    twiml.pause();
                    twiml.say("Please try again or ask differently!", {voice: 'alice'});
                    res.send(twiml.toString());
                } else {
                    // ask IAP as visitor
                    questionAnswer.ask(null, questionTranscript).then(function(result) {
                        // speak back with answer
                        const answerBody = result.response.docs[0].body;
                        twiml.say(answerBody, {voice: 'alice'});
                        twiml.pause({length: 2});
                        // ask if user wants save a copy of QA or keep asking different question
                        twiml.gather({
                            numDigits: 1,
                            action: '/api/phone-question-answer/feedback-on-selection-start'
                        }, (gatherNode) => {
                            if (req.body.Caller === 'client:Anonymous') {
                                gatherNode.say('Press any key to ask a different question or hangup anytime to end the call.', {voice: 'alice'});
                            } else {
                                gatherNode.say('Press 1 to receive your question and answer via text, press 2 to ask a different question or hangup anytime to end the call.', {voice: 'alice'});
                            }
                        });
                        // If the user doesn't enter input, loop to ask question - answer
                        twiml.redirect('/api/phone-question-answer/qa-loop');
                        res.send(twiml.toString());
                        // store QA id by CallSid, prepare to send text of copy to user
                        QACopyAry.unshift({callSid: req.body.CallSid, question: questionTranscript, answer: answerBody});
                        // delete auido file
                        fs.unlink(voiceFileLocalPath, (err) => {
                            if (err)
                                console.error(err);
                            }
                        );
                    }).catch(function(err) {
                        console.error(err);
                        twiml.say(systemErrorMSG, {voice: 'alice'}).hangup();
                        res.send(twiml.toString());
                    });
                }
            }
        });
    }).on('error', (err) => {
        // piping error of audio file
        console.error(err);
        const twiml = new twilio.TwimlResponse();
        twiml.say(systemErrorMSG, {voice: 'alice'}).hangup();
        res.send(twiml.toString());
    });
});

// handle user's selection after asked a question and got the answer
router.post('/feedback-on-selection-start', (req, res) => {
    const twiml = new twilio.TwimlResponse();
    // If the user entered digits, process their request
    if (req.body.Digits) {
        if (req.body.Digits === '1' && req.body.Caller != 'client:Anonymous') {
            twiml.say('Sending a copy of your question and answer to your phone!', {voice: 'alice'}).pause();
            //////////////////////////////////////////////////
            //  SMS QA to caller
            //////////////////////////////////////////////////
            const QAObject = QACopyAry.filter((QA, index) => {
                if (QA.callSid === req.body.CallSid) {
                    QACopyAry.splice(index, 1);
                    return QA;
                }
            })[0];
            // SMS max limit: 1600 characters
            // answer format rule:
            // 1. if answer less than 3 sentences, no change
            // 2. if answer logner than 3 sentances, only keep first 3 sentances, form a url to IAP with a external question, attach with the answer.
            // 3. regualr flag system applies
            // 4. for any url, use google url shortener before send
            const smsBody = "Question: " + QAObject.question + "." + "\n" + "Answer: " + QAObject.answer;
            twilioSMS.messages.create({
                to: req.body.From,
                from: req.body.To,
                body: smsBody
            }, (err, message) => {
                if (err) {
                    console.error(err);
                    twiml.say('There is an issue with SMS service, failed to send the copy, please try again later or report the issue @ www dot IAP dot com/contact.', {voice: 'alice'}).pause();
                } else {
                    twiml.say('Done sending.', {voice: 'alice'});
                }
                twiml.gather({
                    numDigits: 1,
                    action: '/api/phone-question-answer/qa-loop'
                }, (gatherNode) => {
                    gatherNode.say('Do you wish to ask a different question? Press any key for yes or simply hangup to end the call.', {voice: 'alice'});
                });
                res.send(twiml.toString());
            });

        }
        if (req.body.Digits === '2' || req.body.Caller === 'client:Anonymous') {
            twiml.redirect('/api/phone-question-answer/qa-loop');
            res.send(twiml.toString());
        }
        if (req.body.Digits != '1' && req.body.Digits != '2') {
            // if user input any digit other than 1 or 2
            twiml.say('Sorry the selection are not avaliable, Have a nice day!', {voice: 'alice'}).hangup();
            res.send(twiml.toString());
        }
    } else {
        // If no input was sent, redirect to the feedback route
        twiml.say('Sorry, I don\'t understand that choice.').hangup();
        res.send(twiml.toString());
    }
});

// regular QA
router.post('/qa-loop', (req, res) => {
    const twiml = new twilio.TwimlResponse();
    twiml.say("Please go ahead tell me your question and press any key when finished.", {voice: 'alice'});

    // record user question, audio file will be stored in twilio server
    twiml.record({
        maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
        // transcribe: true,
        method: 'POST',
        action: '/api/phone-question-answer/after-record'
    });
    res.send(twiml.toString());
});

// regular QA session, similar like voice-in
module.exports = router;
