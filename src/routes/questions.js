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
const dominatedTermsUtility = require('../system/utility/get-dominated-terms');
const twilio = require('twilio');
const twilioSMS = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const DominatedTerms = require('../models/dominated-term');
import processQuestion from '../system/utility/process-question';
import retrieve_and_rank from '../system/watson/retrieve-rank';
import path from 'path';
import formatter from '../system/utility/formatter';
import TextToSpeechV1 from 'watson-developer-cloud/text-to-speech/v1';
import conversation from '../system/watson/conversation';
import questionsHandle from '../system/utility/questions-handler';

const text_to_speech = new TextToSpeechV1({username: config.watson.text_to_speech.username, password: config.watson.text_to_speech.password});

questionRouter.use(bodyParser.json());

//API get asked question from mongodb: get /questions
questionRouter.route('/').get(function(req, res, next) {
  Questions.find({}).populate('submitter').exec(function(err, question) {
    if (err)
      return next(err);
    res.json(question);
  });
}).delete(function(req, res, next) {
  Questions.remove({}, function(err, resp) {
    if (err)
      return next(err);
    res.json(resp);
  });
});

// questionRouter.route('/test').get(function(req,res,next){
//   Questions.count({'body': "Where do I get textbooks?", 'trained': true}, function(err, count){
//       res.status(200).json(count);
//   });
//   //var count = Questions.find({_id: "5970d4f16acaec2008916653"}, {_id: 1}).limit(1);

// });

//API get asked dominated-terms of questions we trained
questionRouter.route('/dominated-terms').get(function(req, res, next) {
  dominatedTerms.find({}).exec(function(err, terms) {
    if (err)
      return next(err);
    res.json(terms);
  });
})
.post(function(req,res,next){
  // console.log("here");
  // var newDomTerms = dominatedTermsUtility.getDominatedTerms();
  // newDomTerms.save(function(err,resp){
  //        if(err) return nexy(err);
  //        res.json(resp);
  // });
  dominatedTermsUtility.getDominatedTerms()
    .then((data)=>{
      res.status(200).json(data);
    })
    .catch((err)=>{
        if(err) return next(err);
    });
})
.delete(function(req, res, next) {
  dominatedTerms.remove({}, function(err, resp) {
    if (err)
      return next(err);
    res.json(resp);
  });
});

//API handle Untrained questions
questionRouter.route('/untrained')
.get(function(req,res,next){
  Questions.find({'trained': false}, function(err, resp){
    if (err)
      return next(err);
    res.json(resp);
    });
})
.delete(function(req,res,next){
  Questions.remove({'trained': false}, function(err, resp){
    if (err)
      return next(err);
    res.json(resp);
    });
});

//API check low-confidence questions
questionRouter.route('/get-low-confidence').get(function(req,res,next){
  Questions.find({'low_confidence.mark': true, $or:[{'low_confidence.relevance_level':'some'},{'low_confidence.relevance_level':'full'}]}, function(err, questions){
    if (err)
      return next(err);
    res.json(questions);
  })
})
.delete(function(req,res,next){
  Questions.remove({'low_confidence.mark': true, $or:[{'low_confidence.relevance_level':'some'},{'low_confidence.relevance_level':'full'}]}, function(err, resp) {
    if (err)
      return next(err);
    res.json(resp);
  });
});

//API upload trained question to the server to add more terms
questionRouter.route('/dominated-terms/upload-file').post(function(req,res,next){
  console.log(req.files);

  if(req.files){
    let file = req.files.questions;
    let file_name = req.files.questions.name;
    if (path.extname(file_name) != ".txt") {
        return res.status(205).json({
          "message": "Invalid file type! Upload file can be in .txt",
          "error": {
            "name": "FileError",
            "message": "Invalid file type! Upload file can be in .txt",
            "code": 205
          }
        })
    }
    file.mv("./public/system/word-file-temp-folder/"+file_name,function(err){
      if(err){
        console.log(err)
        return next(err);
      }
      else{
         res.status(200).json({
          "message": "successfully upload the file "+req.files.questions.name
          });
      }
    });
  }
  else{
    res.status(200).json({
          "message": "you did not choose any file"
    });
  }
});

// //API lite-version send new question to conversation and retrive-rank: post /question/send-lite
// questionRouter.route('/send-lite').post(function(req, res, next) {
//   var context;
//   if (req.body.context) {
//     context = req.body.context;
//   }
//   //console.log(req.body.context);
//   conversation.questionCheck(req.body.question, context).then((data) => {
//     console.log(data);
//     // if question is general, ask RR
//     if (data.output.text[0] == "-genereal question") {
//       retrieve_and_rank.enterMessage(req.body.question).then((searchResponse) => {
//         searchResponse.context = {};
//         return res.status(200).json(searchResponse);
//       }).catch((err) => {
//         console.error(err);
//         return res.status(302).json(err)
//       });
//     }
//     else if(data.intents[0] && data.intents[0].intent == "Ask_New_Question"){
//       return res.status(200).json({
//         context:{},
//         response: {
//           docs: [
//             {
//               title: "a new question",
//               body: "Sure, just ask your new question."
//             }
//           ]
//         }
//       });
//     }
//     else if(data.output.result){
//       return res.status(200).json({
//         context:{},
//         response: {
//           docs: [
//             {
//               title: "personal question information",
//               body: data.output.text[0]
//             }
//           ]
//         }
//       });
//     }
//     else {
//       return res.status(200).json({
//         context: data.context,
//         response: {
//           docs: [
//             {
//               title: "Conversation continue",
//               body: data.output.text[0]
//             }
//           ]
//         }
//       });
//     }
//   }).catch((err) => {
//     console.log(err);
//     return res.status(302).json(err)
//   });

// });

//temporary send-lite with questions log function
questionRouter.route('/send-lite').post(function(req, res, next) {
  //Users.findById("59708b6acf1559c355555555", function(err, user) {
    //if(err) return next(err);
    let context = {};
    if (req.body.hasOwnProperty('context')) {
      context = req.body.context;
    }
    // if(user.psu_id != null){        //disabled because we are not sure if the user wanna change their psu id
    //   context.PSU_ID = user.psu_id;
    // }
    conversation.questionCheck(req.body.question, context).then((data) => {
      //console.log(data);
      // if question is general, ask RR
      if (data.output.text[0] == "-genereal question" || data.output.result || data.entities[0].entity == 'Irrelevant_Questions') {
        if(data.output.result){
          questionsHandle.questionHandler(data.output.text[0], '59708b6acf1559c355555555')
          .then((resp)=>{
            return res.status(200).json(resp);
          })
          .catch((err)=>{
            return res.status(302).json(err);
          }); 
        }
        else{
          questionsHandle.questionHandler(req.body.question, '59708b6acf1559c355555555')
          .then((resp)=>{
            return res.status(200).json(resp);
          })
          .catch((err)=>{
            return res.status(302).json(err);
          }); 
        }      
      }
      else if(data.output.text[0] == "-a new question"){
        return res.status(200).json({
          context:{},
          response: {
            docs: [
              {
                title: "a new question",
                body: "Sure, just ask your new question."
              }
            ]
          }
        });
      }
      // else if(data.output.result){
      //     return res.status(200).json({
      //       context:{},
      //       response: {
      //         docs: [
      //           {
      //             title: "personal question information",
      //             body: data.output.text[0]
      //           }
      //         ]
      //       }
      //     });
      // }
      else {
        return res.status(200).json({
          context: data.context,
          response: {
            docs: [
              {
                title: "Conversation continue",
                body: data.output.text[0]
              }
            ]
          }
        });
      }
    }).catch((err) => {
      console.log(err);
      return res.status(302).json(err)
    });
  //});


});

//API full-version send new question to conversation and retrive-rank: post /question/send-lite
questionRouter.route('/send').post(Verify.verifyOrdinaryUser, function(req, res, next) {
  Users.findById(req.decoded._id, function(err, user) {
    if(err) return next(err);
    let context = {};
    if (req.body.hasOwnProperty('context')) {
      context = req.body.context;
    }
    // if(user.psu_id != null){        //disabled because we are not sure if the user wanna change their psu id
    //   context.PSU_ID = user.psu_id;
    // }
    conversation.questionCheck(req.body.question, context).then((data) => {
      //console.log(data);
      // if question is general, ask RR
      if (data.output.text[0] == "-genereal question" || data.output.result || data.entities[0].entity == 'Irrelevant_Questions') {
        if(data.output.result){
          questionsHandle.questionHandler(data.output.text[0], req.decoded._id)
          .then((resp)=>{
            return res.status(200).json(resp);
          })
          .catch((err)=>{
            return res.status(302).json(err);
          }); 
        }
        else{
          questionsHandle.questionHandler(req.body.question, req.decoded._id)
          .then((resp)=>{
            return res.status(200).json(resp);
          })
          .catch((err)=>{
            return res.status(302).json(err);
          }); 
        }      
      }
      else if(data.output.text[0] == "-a new question"){
        return res.status(200).json({
          context:{},
          response: {
            docs: [
              {
                title: "a new question",
                body: "Sure, just ask your new question."
              }
            ]
          }
        });
      }
      // else if(data.output.result){
      //     return res.status(200).json({
      //       context:{},
      //       response: {
      //         docs: [
      //           {
      //             title: "personal question information",
      //             body: data.output.text[0]
      //           }
      //         ]
      //       }
      //     });
      // }
      else {
        return res.status(200).json({
          context: data.context,
          response: {
            docs: [
              {
                title: "Conversation continue",
                body: data.output.text[0]
              }
            ]
          }
        });
      }
    }).catch((err) => {
      console.log(err);
      return res.status(302).json(err)
    });
  });


});


//API send new question to retrive-rank: post /question/ask
// questionRouter.route('/ask').post(Verify.verifyOrdinaryUser, function(req, res, next) {
//   // analysis the concept, keyword, taxonomy, entities of the question
//   processQuestion.NLUAnalysis(req.body.question).then((analysis) => {
//     // now process the question and rephrase to AI readable
//     var newQuestion = new Questions();
//     newQuestion.body = req.body.question;
//     console.log(analysis);
//     const questionObj = processQuestion.parseQuestionObj(req.body.question, analysis);
//     newQuestion.feature.concepts = analysis.concepts;
//     newQuestion.feature.keywords = analysis.keywords;
//     newQuestion.feature.entities = analysis.entities;
//     newQuestion.submitter = req.decoded._id;

//     retrieve_and_rank.enterMessage(req.body.question + questionObj.AI_Read_Body).then((searchResponse) => {
//       //console.log(searchResponse);
//       //console.log(newQuestion);
//       if (searchResponse.response.numFound === 0) {
//         // no answer was found in retrieve and rank
//         res.status(200).json({
//           response: {
//             docs: [
//               {
//                 title: "No answer found",
//                 body: "Sorry I can't find any answer for this question, please ask a different question."
//               }
//             ]
//           }
//         })
//       } else {

//         // sort by confidence
//         searchResponse.response.docs.sort(function(a, b) {
//           return b['ranker.confidence'] - a['ranker.confidence'];
//         });

//         // for(let i=0; i<searchResponse.response.docs.length;i++){
//         //     let newAnswer ={
//         //       "title" : searchResponse.response.docs[i].title,
//         //       "body"  : searchResponse.response.docs[i].body,
//         //       "score" : searchResponse.response.docs[i].body,
//         //       "confidence": searchResponse.response.docs[i]["ranker.confidence"]
//         //     };
//         //     console.log(searchResponse.response.docs[i].title);
//         //     newQuestion.answer.push(newAnswer);
//         // }
//         newQuestion.save(function(err, question) {
//           if (err)
//             return next(err);
//           Users.findById(req.decoded._id, function(err, user) {
//             if (err)
//               return next(err);
//             user.question_history.push(question.id);
//             user.save(function(err, resp) {
//               return res.status(200).json(searchResponse);
//             });
//           });
//         });
//       }
//     }).catch((err) => {
//       console.error(err);
//       res.status(302).json(err)
//     })

//   }).catch((err) => {
//     console.error(err);
//     res.status(302).json(err)
//   })

// });

// //API lite-version send new question to retrive-rank: post /question/ask
// questionRouter.route('/ask-lite').post(function(req, res, next) {
//   // analysis the concept, keyword, taxonomy, entities of the question
//   processQuestion.NLUAnalysis(req.body.question).then((analysis) => {
//     // now process the question and rephrase to AI readable
//     const questionObj = processQuestion.parseQuestionObj(req.body.question, analysis);

//     retrieve_and_rank.enterMessage(req.body.question + questionObj.AI_Read_Body).then((searchResponse) => {
//       console.log(searchResponse);
//       if (searchResponse.response.numFound === 0) {
//         // no answer was found in retrieve and rank
//         res.status(200).json({
//           response: {
//             docs: [
//               {
//                 title: "No answer found",
//                 body: "Sorry I can't find any answer for this question, please ask a different question."
//               }
//             ]
//           }
//         })
//       } else {

//         // sort by confidence
//         searchResponse.response.docs.sort(function(a, b) {
//           return b['ranker.confidence'] - a['ranker.confidence'];
//         });

//         res.status(200).json(searchResponse);
//       }
//     }).catch((err) => {
//       console.error(err);
//       res.status(302).json(err)
//     })

//   }).catch((err) => {
//     console.error(err);
//     res.status(302).json(err)
//   })

// });

// twillo phone route

let QACopyAry = [];

questionRouter.route('/ask-phone').post(function(req, res, next) {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.play(config.server_url.public + '/audio/greeting.wav');
  // record user question, audio file will be stored in twilio server
  twiml.record({
    maxLength: 50, timeout: 55, finihOnKey: '1234567890*#',
    // transcribe: true,
    method: 'POST',
    action: '/questions/ask-phone/callback'
  });
  res.send(twiml.toString());
});

questionRouter.route('/ask-phone/callback').post(function(req, res, next) {

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

  console.log(voiceFileLocalPath);

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
          twiml.redirect('/questions/ask-phone/qa-loop');
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
          twiml.redirect('/questions/ask-phone/qa-loop');
          res.send(twiml.toString());
        } else {
          // ask IAP as visitor
          retrieve_and_rank.enterMessage(questionTranscript).then(function(result) {
            // speak back with answer
            if (!result.response.docs) {
              twiml.say("Sorry I don't know the answer to this question")
              twiml.redirect('/questions/ask-phone/qa-loop');
            }
            const answerBody = formatter.removeTagsAndRelateInfoFromSMSAnswer(result.response.docs[0].body);
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
              const gather = twiml.gather({timeout: 3, numDigits: 1, action: '/questions/ask-phone/feedback'});
              if (req.body.Caller === 'client:Anonymous') {
                gather.play(config.server_url.public + '/audio/reask-or-hangup.wav');
              } else {
                gather.play(config.server_url.public + '/audio/text-or-reask.wav');
              }
              // If the user doesn't enter input, loop to ask question - answer
              twiml.redirect('/questions/ask-phone/qa-loop');
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

questionRouter.route('/ask-phone/feedback').post(function(req, res, next) {
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
        const gather = twiml.gather({timeout: 3, numDigits: 1, action: '/questions/ask-phone/qa-loop'});
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

// twillo SMS routes
questionRouter.post('/ask-sms', (req, res) => {
  retrieve_and_rank.enterMessage(req.body.Body).then(function(result) {
    // speak back with answer
    const answerBody = formatter.removeTagsAndRelateInfoFromSMSAnswer(rsult.response.docs[0].body);
    twilioSMS.messages.create({
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

questionRouter.post('/log-question', function(req,res,next){
  Questions.findOne({body:req.body.question},function(err,question){
    if(err) return next(err);
    question.temp_answer_holder = req.body.answers;
    question.low_confidence.mark = true;
    question.low_confidence.relevance_level = "some";
    question.save(function(err,resp){
      if(err) return next(err);
      res.status(200).json({
        'message': 'logged'
      });
    });
  });
});

module.exports = questionRouter;
