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
    const voiceFileUrl = req.body.RecordingUrl;
    const voiceFileWAVUrl = voiceFileUrl + ".wav";
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
                // confidence
                const transcriptArruracy = resultTranscript.results[0].alternatives.confidence;
                // if no transcript or low accurate on interpration
                if (!resultTranscript.results[0].alternatives[0].hasOwnProperty('transcript') || resultTranscript.results[0].alternatives[0].confidence <= 0.6) {
                    twiml.say("Sorry I not sure what you said, please try again or ask differently!", {voice: 'alice'});
                    res.send(twiml.toString());
                } else {
                    // STT transcript
                    const transcript = resultTranscript.results[0].alternatives[0].transcript;
                    // ask IAP as visitor
                    questionAnswer.ask(null, transcript).then(function(result) {
                        // start QA looping
                        twiml.say(result.response.docs[0].body, {voice: 'alice'});
                        res.send(twiml.toString());
                    }).catch(function(err) {
                        console.error(err);
                        twiml.say(systemErrorMSG, {voice: 'alice'}).hangup();
                        res.send(twiml.toString());
                    });
                }
                // delete audio file
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

module.exports = router;
