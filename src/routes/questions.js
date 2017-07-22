const express = require('express');
const questionRouter = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
const request = require('request');
const mongoose = require('mongoose');
const Questions = require('../models/question');
//const Answers = require('../models/answer'); independent answer schema unused
const Users = require('../models/user');
const config = require('../config');
const Verify = require('../system/utility/verify');
const twilio = require('twilio');
const twilioSMS = require('twilio')('AC986df3d5c5b5185f845ac46499758075', '8953462aa58c2dfaf97835ef40b26fc5');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
import processQuestion from '../system/utility/process-question';
import retrieve_and_rank from '../system/watson/retrieve-rank';

const systemErrorMSG = "Sorry there is an issue in system, please try again later or contact us!";
questionRouter.use(bodyParser.json());

//API get asked question from mongodb: get /questions
questionRouter.route('/')
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
  Questions.find({}).populate('submitter').exec(function(err, question) {
    if (err)
      return next(err);
    res.json(question);
  });
})
.delete(function(req,res,next){
  Questions.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

//API send new question to retrive-rank: post /question/ask
questionRouter.route('/ask')
.post(Verify.verifyOrdinaryUser, function(req, res, next) {
  // analysis the concept, keyword, taxonomy, entities of the question
  var newQuestion = new Questions();
  newQuestion.body = req.body.question;
  processQuestion.NLUAnalysis(req.body.question).then((analysis) => {
    // now process the question and rephrase to AI readable
    console.log(analysis);
    const questionObj = processQuestion.parseQuestionObj(req.body.question, analysis);
    newQuestion.feature.concepts = analysis.concepts;
    newQuestion.feature.keywords = analysis.keywords;
    newQuestion.feature.entities = analysis.entities;
    newQuestion.submitter = req.decoded._id;
    retrieve_and_rank.enterMessage(req.body.question + questionObj.AI_Read_Body).then((searchResponse) => {
      console.log(searchResponse);
      console.log(newQuestion);
      if (searchResponse.response.numFound === 0) {
        // no answer was found in retrieve and rank
        res.status(200).json({
          response: {
            docs: [
              {
                title: "No answer found",
                body: "Sorry I can't find any answer for this question, please ask a different question."
              }
            ]
          }
        })
      } else {

        // sort by confidence
        searchResponse.response.docs.sort(function(a, b) {
          return b['ranker.confidence'] - a['ranker.confidence'];
        });

        // for(let i=0; i<searchResponse.response.docs.length;i++){
        //     let newAnswer ={
        //       "title" : searchResponse.response.docs[i].title,
        //       "body"  : searchResponse.response.docs[i].body,
        //       "score" : searchResponse.response.docs[i].body,
        //       "confidence": searchResponse.response.docs[i]["ranker.confidence"]
        //     };
        //     console.log(searchResponse.response.docs[i].title);
        //     newQuestion.answer.push(newAnswer);
        // }
        newQuestion.save(function(err,question){
          if (err) return next(err);
          Users.findById(req.decoded._id,function(err,user){
            if(err) return next(err);
            user.question_history.push(question.id);
            user.save(function(err,resp){
              return res.status(200).json(searchResponse);
            });
          });
        });
      }
    }).catch((err) => {
      console.error(err);
      res.status(302).json(err)
    })

  }).catch((err) => {
    console.error(err);
    res.status(302).json(err)
  })

});

//API lite-version send new question to retrive-rank: post /question/ask
questionRouter.route('/ask-lite')
.post(function(req, res, next) {
  // analysis the concept, keyword, taxonomy, entities of the question
  processQuestion.NLUAnalysis(req.body.question).then((analysis) => {
    // now process the question and rephrase to AI readable
    const questionObj = processQuestion.parseQuestionObj(req.body.question, analysis);

    retrieve_and_rank.enterMessage(req.body.question + questionObj.AI_Read_Body).then((searchResponse) => {
      console.log(searchResponse);
      if (searchResponse.response.numFound === 0) {
        // no answer was found in retrieve and rank
        res.status(200).json({
          response: {
            docs: [
              {
                title: "No answer found",
                body: "Sorry I can't find any answer for this question, please ask a different question."
              }
            ]
          }
        })
      } else {

        // sort by confidence
        searchResponse.response.docs.sort(function(a, b) {
          return b['ranker.confidence'] - a['ranker.confidence'];
        });

        res.status(200).json(searchResponse);
      }
    }).catch((err) => {
      console.error(err);
      res.status(302).json(err)
    })

  }).catch((err) => {
    console.error(err);
    res.status(302).json(err)
  })

});

let QACopyAry = [];

questionRouter.route('/ask-phone')
.post(function(req,res,next){
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("Hello! Thanks for calling the Intelligent Academic Advisor, please tell me your question and press any key when finished.", {voice: 'alice'});
    // record user question, audio file will be stored in twilio server
    twiml.record({
        maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
        // transcribe: true,
        method: 'POST',
        action: '/questions/ask-phone/callback'
    });
    res.send(twiml.toString());

});

questionRouter.route('/ask-phone/callback')
.post(function(req,res,next){

    var speech_to_text = new SpeechToTextV1({
        username: config.watson.speech_to_text.username,
        password: config.watson.speech_to_text.password,
        headers: {
            'X-Watson-Learning-Opt-Out': 'true'
        }
    });

    console.log(req.body);
    const voiceFileWAVUrl = req.body.RecordingUrl.toString().concat(".wav");
    const caller = req.body.From;
    const voiceFileLocalPath = 'C:\\GitHub\\Intelligent-Academic-Advisor\\src\\system\\audio-file-temp-folder'+"\\" + req.body.RecordingSid + ".wav";
    console.log(voiceFileWAVUrl);
    console.log(voiceFileLocalPath);
    //console.log(fs.createWriteStream(voiceFileLocalPath));
    //console.log(fs.createReadStream(voiceFileLocalPath));
    request(voiceFileWAVUrl).pipe(fs.createWriteStream(voiceFileLocalPath)).on('finish', () => {
        
        const params = {
            audio: fs.createReadStream(voiceFileLocalPath),
            content_type: 'audio/wav',
            model: 'en-US_NarrowbandModel',
            timestamps: true,
            word_alternatives_threshold: 0.9,
            continuous: true
        };
        console.log(voiceFileLocalPath);
        const twiml = new twilio.twiml.VoiceResponse();
        speech_to_text.recognize(params, function(error, resultTranscript) {
            if (error) {
                console.error(error);
                twiml.say(systemErrorMSG, {voice: 'alice'}).hangup();
                res.send(twiml.toString());
                return;
            } else {
                console.log(JSON.stringify(resultTranscript, null, 2));
                // STT transcript (question body)
                console.log(resultTranscript.results.length);
                if (resultTranscript.results.length == 0) {
                    twiml.say("Sorry I didn't hear anything", {voice: 'alice'});
                    twiml.pause();
                    twiml.redirect('/questions/ask-phone/qa-loop');
                    res.send(twiml.toString());
                }
                const questionTranscript = resultTranscript.results[0].alternatives[0].transcript;
                // confidence
                const transcriptArruracy = resultTranscript.results[0].alternatives[0].confidence;
                // if no transcript or low accurate on interpration
                if (!resultTranscript.results[0].alternatives[0].hasOwnProperty('transcript') || transcriptArruracy <= 0.6) {
                    twiml.say("Sorry I am not sure what you said of ", {voice: 'alice'});
                    twiml.pause();
                    twiml.say(questionTranscript, {voice: 'alice'});
                    twiml.pause();
                    twiml.say("Please try again or ask differently!", {voice: 'alice'});
                    twiml.redirect('/questions/ask-phone/qa-loop');
                    res.send(twiml.toString());
                } else {
                    // ask IAP as visitor
                    retrieve_and_rank.enterMessage(questionTranscript).then(function(result) {
                        // speak back with answer
                        if(!result.response.docs){
                          twiml.say("Sorry I don't know the answer to this question")
                          twiml.redirect('/questions/ask-phone/qa-loop');
                          fs.unlink(voiceFileLocalPath, (err) => {
                            if (err)
                                console.error(err);
                            }
                          );
                        }
                        const answerBody = result.response.docs[0].body;
                        twiml.say(answerBody, {voice: 'alice'});
                        twiml.pause({length: 2});
                        // ask if user wants save a copy of QA or keep asking different question
                        // twiml.gather({
                        //     timeout: 3,
                        //     numDigits: 1,
                        //     action: '/questions/ask-phone/feedback'
                        // }, (gatherNode) => {
                        //     console.log(req);
                        //     if (req.body.Caller === 'client:Anonymous') {
                        //         gatherNode.say('Press any key to ask a different question or hangup anytime to end the call.', {voice: 'alice'});
                        //     } else {
                        //         gatherNode.say('Press 1 to receive your question and answer via text, press 2 to ask a different question or hangup anytime to end the call.', {voice: 'alice'});
                        //     }
                        // });
                        const gather = twiml.gather({
                              timeout: 3,
                              numDigits: 1,
                              action: '/questions/ask-phone/feedback'
                        });
                        if (req.body.Caller === 'client:Anonymous') {
                                gather.say('Press any key to ask a different question or hangup anytime to end the call.', {voice: 'alice'});
                        } else {
                                gather.say('Press 1 to receive your question and answer via text, press 2 to ask a different question or hangup anytime to end the call.', {voice: 'alice'});
                        }
                        // If the user doesn't enter input, loop to ask question - answer
                        twiml.redirect('/questions/ask-phone/qa-loop');
                        res.send(twiml.toString());
                        // store QA id by CallSid, prepare to send text of copy to user
                        QACopyAry.unshift({callSid: req.body.CallSid, question: questionTranscript, answer: answerBody});
                        //delete auido file
                        fs.unlink(voiceFileLocalPath, (err) => {
                            if (err)
                                console.error(err);
                            }
                        );
                    }).catch(function(err) {
                        console.error(err);
                        twiml.say(systemErrorMSG, {voice: 'alice'});
                        twiml.hangup();
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
        twiml.hangup();
        res.send(twiml.toString());
    });

});

questionRouter.route('/ask-phone/feedback')
.post(function(req,res,next){
    const twiml = new twilio.twiml.VoiceResponse();
    // If the user entered digits, process their request
    console.log(req.body);
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
            console.log(QAObject);
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
                const gather = twiml.gather({
                    timeout: 3,
                    numDigits: 1,
                    action: '/questions/ask-phone/qa-loop'
                });
                gather.say('Do you wish to ask a different question? Press one for yes or simply hangup to end the call.', {voice: 'alice'});
                res.send(twiml.toString());
            });
            // SMS max limit: 1600 characters
            // answer format rule:
            // 1. if answer less than 3 sentences, no change
            // 2. if answer logner than 3 sentances, only keep first 3 sentances, form a url to IAP with a external question, attach with the answer.
            // 3. regualr flag system applies
            // 4. for any url, use google url shortener before send
            
            // twiml.sms({
            //     from: req.body.To,
            //     to: req.body.From
            // }, smsBody);
            // console.log(smsBody);
            // console.log(twiml.toString());
            // // const gather = twiml.gather({
            // //         timeout: 3,
            // //         numDigits: 1,
            // //         action: '/questions/ask-phone/qa-loop'
            // // });
            // // gather.say('Do you wish to ask a different question? Press one for yes or simply hangup to end the call.', {voice: 'alice'});
            // res.send(twiml.toString());
        }
        if (req.body.Digits === '2' || req.body.Caller === 'client:Anonymous') {
            twiml.redirect('/questions/ask-phone/qa-loop');
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

questionRouter.post('/ask-phone/qa-loop', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("Please tell me your question and press any key when finished.", {voice: 'alice'});

    // record user question, audio file will be stored in twilio server
    twiml.record({
        maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
        // transcribe: true,
        method: 'POST',
        action: '/questions/ask-phone/callback'
    });
    res.send(twiml.toString());
});

module.exports = questionRouter;
