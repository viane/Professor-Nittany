'use strict'
const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const accountUtility = require(appRoot + '/app/utility-function/account');
let User = require(appRoot + '/app/models/user');
const questionAnswer = require(appRoot + '/app/question-answer');

router.post('/visitor/ask', (req, res) => {
    const question = req.body.question;
    // ask IAP as visitor
    questionAnswer.ask(null, question).then(function(result) {
        res.send(result.response.docs);
    }).catch(function(err) {
        console.error(err);
        res.send(err);
    });
});

module.exports = router;
