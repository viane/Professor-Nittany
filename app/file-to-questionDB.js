// app/file-to-questionDB.js
// take input text file, batch process questions line by line to question DB
'use strict'

var express = require('express');

var router = express.Router();

const Question = require('./models/question');

router.post('/upload-question', function (req, res, next) {
  var question = new Question();
  question.body = req.body.text;

  question.save()
  .then(function(saveedQuestion) {
      res.send({type: 'success', information: 'Successfully saved question.', question: saveedQuestion});
  })
  .catch(function (err) {
      throw err
      res.send({type: 'error', information: err});
  })
})

module.exports = router
