const express = require('express');
const questionRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Questions = require('../models/question');
//const Answers = require('../models/answer'); independent answer schema unused
const Users = require('../models/user');
const config = require('../config');
const Verify = require('../system/utility/verify');
const dominatedTermsUtility = require('../system/utility/get-dominated-terms');
const DominatedTerms = require('../models/dominated-term');
import processQuestion from '../system/utility/process-question';
import retrieve_and_rank from '../system/watson/retrieve-rank';
import path from 'path';
import formatter from '../system/utility/formatter';
import conversation from '../system/watson/conversation';
import questionsHandle from '../system/utility/questions-handler';


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
