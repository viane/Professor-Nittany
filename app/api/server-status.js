'use strict'

const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');
const serverStatus = require(appRoot + '/app/server-status');

// get api for server questionFeeds
router.get('/get-question-feeds', (req,res)=> {
  res.send({feeds : serverStatus.getRecentAskedQuestions()});
});

module.exports = router;
