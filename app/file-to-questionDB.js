// app/file-to-questionDB.js
// take input text file, batch process questions line by line to question DB
'use strict'

var appRoot = require('app-root-path');

var express = require('express');

var router = express.Router();

const Question = require(appRoot+'/app/models/question');

router.post('/upload-question', function (req, res, next) {
  var question = new Question();
  question.body = req.body.text;
  question.inputFileName = req.body.fileName;
  question.submitter = req.user._id;

  // use alchemyAPI to get rest propreties to record;
  question.keyword = [{}];
  question.concept = [{}];
  question.taxonomy = [{}];

  question.save()
  .then(function(savedQuestion) {
      res.send({type: 'success', information: 'Successfully saved question.', question: savedQuestion});
  })
  .catch(function (err) {
      throw err
      res.send({type: 'error', information: err});
  })
})

module.exports = router
