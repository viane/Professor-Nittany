const express = require('express');
const questionRouter = express.Router();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Questions = require('../models/question');
//const Answers = require('../models/answer'); independent answer schema unused
const Users = require('../models/user');
const config = require('../config');
const Verify = require('../system/utility/verify');
import processQuestion from '../system/utility/process-question';
import retrieve_and_rank from '../system/watson/retrieve-rank';

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
    newQuestion.concepts = analysis.concepts;
    newQuestion.keywords = analysis.keywords;
    newQuestion.entities = analysis.entities;
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

module.exports = questionRouter;
