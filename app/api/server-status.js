'use strict'

const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');
const serverStatus = require(appRoot + '/app/server-status');
const loginChecking = require(appRoot + '/app/utility-function/login-checking');

// get api for server questionFeeds
router.get('/get-question-feeds', (req, res) => {
    res.send({feeds: serverStatus.getRecentAskedQuestions()});
});

// get api for list advisors
router.get('/get-advisor-list', loginChecking.isLoggedInRedirect, (req, res) => {
    // send advisor information as array
    setTimeout(()=> {
        res.send({advisors: serverStatus.getAdvisorList()})
    }, 1000)
});

// used for demo, get question analysis for last asked questionFeeds
router.get('/get-last-question-analysis', (req, res) => {
    res.send({analysis: serverStatus.getLastQuestionAnalysis()});
});

module.exports = router;
