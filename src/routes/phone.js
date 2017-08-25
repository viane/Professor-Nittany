// twillo phone route
const express = require('express');
const phoneRouter = express.Router();
const bodyParser = require('body-parser');
const config = require('../config');
const twilio = require('twilio');
const request = require('request');
const fs = require('fs');
const twilioSMS = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
import retrieve_and_rank from '../system/watson/retrieve-rank';
import formatter from '../system/utility/formatter';
import path from 'path';
import TextToSpeechV1 from 'watson-developer-cloud/text-to-speech/v1';
const text_to_speech = new TextToSpeechV1({username: config.watson.text_to_speech.username, password: config.watson.text_to_speech.password});
import googleUrlShortener from '../system/google/url-shortener';

let QACopyAry = [];

phoneRouter.use(bodyParser.json());

phoneRouter.route('/ask-phone').post(function(req, res, next) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.play(config.server_url.public + '/audio/greeting.wav');
  // record user question, audio file will be stored in twilio server
  twiml.record({
    maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
    // transcribe: true,
    method: 'POST',
    action: '/phone/ask-phone/callback'
  });
  res.send(twiml.toString());
});

phoneRouter.route('/ask-phone/callback').post(function(req, res, next) {
  var speech_to_text = new SpeechToTextV1({
    username: config.watson.speech_to_text.username,
    password: config.watson.speech_to_text.password,
    headers: {
      'X-Watson-Learning-Opt-Out': 'true'
    }
  });

  const voiceFileWAVUrl = req.body.RecordingUrl.toString().concat(".wav");

  const caller = req.body.From;

  const voiceFileLocalPath = path.join(__dirname, '../system/audio/audio-file-temp-folder/') + req.body.RecordingSid + "-question.wav";

  request(voiceFileWAVUrl).pipe(fs.createWriteStream(voiceFileLocalPath)).on('finish', () => {
    const params = {
      audio: fs.createReadStream(voiceFileLocalPath),
      content_type: 'audio/wav',
      model: 'en-US_NarrowbandModel',
      timestamps: true,
      word_alternatives_threshold: 0.9,
      continuous: true
    };
    const twiml = new twilio.twiml.VoiceResponse();
    speech_to_text.recognize(params, function(error, resultTranscript) {
      //delete auido file
      fs.unlink(voiceFileLocalPath, (err) => {
        if (err)
          console.error(err);
        }
      );
      if (error) {
        console.error(error);
        twiml.play(config.server_url.public + '/audio/system-error.wav');
        twiml.pause();
        twiml.say("Good Bye!", {voice: 'alice'});
        return res.send(twiml.toString());
      } else {
        // console.log(JSON.stringify(resultTranscript, null, 2));
        // STT transcript (question body)
        if (resultTranscript.results.length == 0) {
          twiml.say("Sorry I didn't hear anything", {voice: 'alice'});
          twiml.pause();
          twiml.redirect('/phone/ask-phone/qa-loop');
          return res.send(twiml.toString());
        }
        const questionTranscript = resultTranscript.results[0].alternatives[0].transcript;
        // confidence
        const transcriptArruracy = resultTranscript.results[0].alternatives[0].confidence;
        // if no transcript or low accurate on interpration
        if (!resultTranscript.results[0].alternatives[0].hasOwnProperty('transcript') || transcriptArruracy <= 0.48) {
          twiml.say("Sorry I am not sure what you said of ", {voice: 'alice'});
          twiml.pause();
          twiml.say(questionTranscript, {voice: 'alice'});
          twiml.pause();
          twiml.say("Please try again or ask differently!", {voice: 'alice'});
          twiml.redirect('/phone/ask-phone/qa-loop');
          res.send(twiml.toString());
        } else {
          // ask IAP as visitor
          retrieve_and_rank.enterMessage(questionTranscript).then(function(result) {
            // speak back with answer
            if (!result.response.docs) {
              twiml.say("Sorry I don't know the answer to this question")
              twiml.redirect('/phone/ask-phone/qa-loop');
            }
            const answerBody = formatter.removeAnswerTags(result.response.docs[0].body);
            // console.log(answerBody);
            const TTS_Params = {
              text: answerBody,
              voice: 'en-US_AllisonVoice',
              accept: 'audio/wav'
            };
            // Pipe the synthesized text to a file.
            const answerFilePath = path.join(__dirname, '../views/audio/') + req.body.RecordingSid + "-answer.wav";
            const answerURL = config.server_url.public + '/audio/' + req.body.RecordingSid + "-answer.wav";
            text_to_speech.synthesize(TTS_Params).on('error', function(error) {
              console.error(error);
              twiml.play(config.server_url.public + '/audio/system-error.wav');
              twiml.pause();
              res.send(twiml.toString());
            }).pipe(fs.createWriteStream(answerFilePath)).on('finish', () => {
              twiml.play(answerURL);
              twiml.pause();
              // ask if user wants save a copy of QA or keep asking different question
              const gather = twiml.gather({timeout: 3, numDigits: 1, action: '/phone/ask-phone/feedback'});
              if (req.body.Caller === 'client:Anonymous') {
                gather.play(config.server_url.public + '/audio/reask-or-hangup.wav');
              } else {
                gather.play(config.server_url.public + '/audio/text-or-reask.wav');
              }
              // If the user doesn't enter input, loop to ask question - answer
              twiml.redirect('/phone/ask-phone/qa-loop');
              res.send(twiml.toString());
              // store QA id by CallSid, prepare to send text of copy to user
            });
            QACopyAry.unshift({callSid: req.body.CallSid, question: questionTranscript, answer: answerBody});
          }).catch(function(err) {
            console.error(err);
            twiml.play(config.server_url.public + '/audio/system-error.wav');
            twiml.pause();
            res.send(twiml.toString());
          });
        }
      }
    });
  }).on('error', (err) => {
    // piping error of audio file
    console.error(err);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say(systemErrorMSG, {voice: 'alice'})
    twiml.pause();
    twiml.say("Good Bye!", {voice: 'alice'});
    res.send(twiml.toString());
  });

});

phoneRouter.route('/ask-phone/feedback').post(function(req, res, next) {
  const twiml = new twilio.twiml.VoiceResponse();
  // If the user entered digits, process their request
  // console.log(req.body);
  if (req.body.Digits) {
    if (req.body.Digits === '1' && req.body.Caller != 'client:Anonymous') {
      twiml.say('Sending a copy of your question and answer to your phone!', {voice: 'alice'})
      twiml.pause();
      //////////////////////////////////////////////////
      //  SMS QA to caller
      //////////////////////////////////////////////////
      const QAObject = QACopyAry.filter((QA, index) => {
        if (QA.callSid === req.body.CallSid) {
          QACopyAry.splice(index, 1);
          return QA;
        }
      })[0];
      // console.log(QAObject);

      const smsBody = "Question: " + QAObject.question + "." + "\n" + "Answer: " + QAObject.answer;
      twilioSMS.messages.create({
        to: req.body.From,
        from: req.body.To,
        body: smsBody
      }, (err, message) => {
        if (err) {
          console.error(err);
          twiml.say('There is an issue with SMS service, failed to send the copy, please try again later or report the issue @ www dot IAP dot com/contact.', {voice: 'alice'});
          twiml.pause();
        } else {
          twiml.say('Done sending.', {voice: 'alice'});
        }
        const gather = twiml.gather({timeout: 3, numDigits: 1, action: '/phone/ask-phone/qa-loop'});
        gather.play(config.server_url.public + '/audio/reask-or-hangup.wav');
        res.send(twiml.toString());
      });
      // SMS max limit: 1600 characters
      // answer format rule:
      // 1. if answer less than 3 sentences, no change
      // 2. if answer logner than 3 sentances, only keep first 3 sentances, form a url to IAP with a external question, attach with the answer.
      // 3. regualr flag system applies
      // 4. for any url, use google url shortener before send
    }
    if (req.body.Digits === '2' || req.body.Caller === 'client:Anonymous') {
      twiml.redirect('/phone/ask-phone/qa-loop');
      res.send(twiml.toString());
    }
    if (req.body.Digits != '1' && req.body.Digits != '2') {
      // if user input any digit other than 1 or 2
      twiml.say('Sorry the selection are not avaliable, Have a nice day!', {voice: 'alice'})
      twiml.hangup();
      res.send(twiml.toString());
    }
  } else {
    // If no input was sent, redirect to the feedback route
    twiml.say('Sorry, I don\'t understand that choice.')
    twiml.hangup();
    res.send(twiml.toString());
  }
});

phoneRouter.post('/ask-phone/qa-loop', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("Please tell me your question and press any key when finished.", {voice: 'alice'});

  // record user question, audio file will be stored in twilio server
  twiml.record({
    maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
    // transcribe: true,
    method: 'POST',
    action: '/phone/ask-phone/callback'
  });
  res.send(twiml.toString());
});

// twillo SMS routes
phoneRouter.post('/ask-sms', (req, res) => {
  const questionBody = req.body.Body;
  retrieve_and_rank.enterMessage(questionBody).then(function(result) {
    // speak back with answer
    let answerBody = formatter.removeAnswerTags(result.response.docs[0].body); //remove tags
    // check if message is too long to be in SMS
    if (answerBody.indexOf("[\\n]") !== -1) {
      // answer has [\n] tag, truncate after 1st [\n]
      answerBody = answerBody.substring(0, answerBody.indexOf('[\\n]'));
      if (answerBody.length > 250) {
        const urlStringEncode = encodeURI(questionBody);
        console.log(urlStringEncode);
        googleUrlShortener.shortUrl("intelligent-student-advisor.herokuapp.com/lite-version.html?q=" + urlStringEncode).then(sURL => {
          const shortenUrl = sURL;
          answerBody += " ...";
          answerBody += "\nThe answer is quite long, check " + shortenUrl + " for full answer!";
          return twilioSMS.messages.create({
            to: req.body.From,
            from: req.body.To,
            body: answerBody
          }, (err, message) => {
            if (err) {
              console.error(err);
              return res.status(400);
            }
            res.status(200);
          });
        })
      }
    } else {
      answerBody = answerBody.substring(0, 250);
      return twilioSMS.messages.create({
        to: req.body.From,
        from: req.body.To,
        body: answerBody
      }, (err, message) => {
        if (err) {
          console.error(err);
          return res.status(400);
        }
        res.status(200);
      });
    }
  }).catch(function(err) {
    console.error(err);
    twilioSMS.messages.create({
      to: req.body.From,
      from: req.body.To,
      body: "There is an issue with the system, please try again later or contact us!"
    }, (err, message) => {
      if (err) {
        console.error(err);
        return res.status(400);
      }
      res.status(200);
    });
  });
});

// googleUrlShortener.shortUrl("http://localhost:3000/lite-version.html?q=how%20to%20check%20my%20schedule%3F").then(sURL=>{
//   console.log(sURL);
// })

module.exports = phoneRouter;
