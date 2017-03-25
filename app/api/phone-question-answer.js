'use strict'
const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
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

// API for accepting user call in, record voice to twilio server then callback to /api/phone/recording
router.post('/voice-in', (req, res) => {
    const twiml = new twilio.TwimlResponse();
    twiml.say("Hello! Thanks for calling the Intelligent Academic Planer, please go ahead tell me your question and press any key when finished.", {voice: 'alice'});

    // record user question, audio file will be stored in twilio server
    twiml.record({
        playBeep: true, maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
        // transcribe: true,
        method: 'POST',
        action: '/api/phone/after-record'
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
                console.log(JSON.stringify(resultTranscript, null, 2));
                // STT transcript (question body)
                const transcript = resultTranscript.results[0].alternatives[0].transcript;
                // confidence
                const transcriptArruracy = resultTranscript.results[0].alternatives.confidence;
                // if no transcript or low accurate on interpration
                if (!resultTranscript.results[0].alternatives[0].hasOwnProperty('transcript') || transcriptArruracy <= 0.6) {
                    twiml.say("Sorry I not sure what you said of ", {voice: 'alice'});
                    twiml.say(transcript, {voice: 'alice'});
                    twiml.say("Please try again or ask differently!", {voice: 'alice'});
                    res.send(twiml.toString());
                } else {
                    // ask IAP as visitor
                    questionAnswer.ask(null, transcript).then(function(result) {
                        // start QA looping
                        const answerBody = result.response.docs[0].body;
                        twiml.say(answerBody, {
                            voice: 'alice'
                        }, () => {
                            this.redirect({
                                method: 'POST',
                                action: '/api/phone/qa-feedback-start',
                                url: '/api/phone/qa-feedback-start',
                                question: transcript,
                                answer: answerBody,
                                localFilePath: voiceFileLocalPath
                            });
                        }); //twiml.redirect('/voice');
                        res.send(twiml.toString());
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

// After watson answered, accepting feedback
router.post('/qa-feedback-start', (req, res) => {
    console.log(req.body);
    // question body
    // answer body
    // caller
    const longUrl = '';
    const data = {key :'AIzaSyC3RngXLBgnzcrjoYr0zp959d45yl1id6g',longUrl:longUrl};
    fetch('https://www.googleapis.com/urlshortener/v1/url', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(function(res) {
        return res.json();
    }).then(function(json) {
        console.log(json);
    });
    // - send question, answer to user's phone via SMS with a shorten URL to IAP for this QA
    const twiml = new twilio.TwimlResponse();
    twiml.say("Press 1 to receive your question and answer via text or press 2 to ask a different question.", {voice: 'alice'});

    twiml.gather({
        numDigits: 1,
        action: '/api/phone/feedback-on-selection-start'
    }, (gatherNode) => {
        gatherNode.say('Press 1 to receive your question and answer via text or press 2 to ask a different question.', {voice: 'alice'});
    });

    // If the user doesn't enter input, loop to ask question - answer
    twiml.redirect('/api/phone/qa-loop');
    res.send(twiml.toString());
});

// handle user's selection after asked a question and got the answer
router.post('/feedback-on-selection-start', (req, res) => {
  // Use the Twilio Node.js SDK to build an XML response
let twiml = new twilio.TwimlResponse();

// If the user entered digits, process their request
if (req.body.Digits) {
  if (req.body.Digits === '1') {
    twiml.say('Sending a copy of your question and answer to your phone!', {voice:'alice'},()=>{
      this.say('Do you want to ask another question? Press 1 for yes, or simply hangup to end the call.', {voice:'alice'}, ()=>{
        twiml.gather({
            numDigits: 1,
            action: '/api/phone/qa-loop',
            finishOnKey:'1',
            timeout:'10',
            method:'POST'
        })
      });
    }).pause();
  }
  if (req.body.Digits === '2') {
    twiml.redirect('/api/phone/qa-loop');
  }else{
    // if user input any digit other than 1 or 2
    twiml.say('Sorry the selection are not avaliable, Have a nice day!', {voice:'alice'}).hangup();
  }
} else {
  twiml.say('Sorry, I don\'t understand that choice.').pause();
  // If no input was sent, redirect to the feedback route
  twiml.redirect('/api/phone/qa-feedback');
}

// Render the response as XML in reply to the webhook request
response.send(twiml.toString());
});

// API for after first QA done, start looping QA until user hangup
router.post('/qa-loop', (req, res) => {});
  // regular QA session, similar like voice-in
module.exports = router;
