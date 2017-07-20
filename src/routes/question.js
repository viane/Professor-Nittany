const express = require('express');
const questionRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Questions = require('../models/question');
const config = require('../config');
const Verify = require('../system/utility/verify');
import processQuestion from '../system/utility/process-question';
import retrieve_and_rank from '../system/watson/retrieve-rank';

questionRouter.use(bodyParser.json());

//API get asked question from mongodb: get /questions
questionRouter.route('/').get(Verify.verifyOrdinaryUser, function(req, res, next) {
  Questions.find({"question_submitter": req.decoded._id}).populate('question_submitter').exec(function(err, question) {
    if (err)
      return next(err);
    res.json(question);
  });
})

//API send new question to retrive-rank: post /question/ask
questionRouter.route('/ask').post(Verify.verifyOrdinaryUser, function(req, res, next) {
  // analysis the concept, keyword, taxonomy, entities of the question
  processQuestion.NLUAnalysis(req.body.question).then((analysis) => {
    // now process the question and rephrase to AI readable
    const questionObj = processQuestion.parseQuestionObj(req.body.question, analysis);

    retrieve_and_rank.enterMessage(req.body.question + questionObj.AI_Read_Body).then((searchResponse) => {
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

        // trim to 10 if there are more answers
        while (searchResponse.response.docs.length > 10) {
          searchResponse.response.docs.pop();
        }

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
