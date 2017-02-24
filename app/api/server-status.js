'use strict'

const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');
const serverStatus = require(appRoot + '/app/server-status');

// get api for server questionFeeds
router.get('/get-question-feeds', (req,res)=> {
  res.send({feeds : serverStatus.getRecentAskedQuestions()});
});

// used for demo, get question analysis for last asked questionFeeds
router.get('/get-last-question-analysis', (req,res)=> {
  res.send({analysis : serverStatus.getLastQuestionAnalysis()});
});

module.exports = router;
