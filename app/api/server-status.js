'use strict'

const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');
const serverStatus = require(appRoot + '/app/server-status');
const loginChecking = require(appRoot + '/app/utility-function/login-checking');
const User = require(appRoot + '/app/models/user');

// get api for server questionFeeds
router.get('/get-question-feeds', (req, res) => {
    res.send({feeds: serverStatus.getRecentAskedQuestions()});
});

// get api for list advisors
router.get('/get-advisor-list', loginChecking.isLoggedInRedirect, (req, res) => {
    User.find({
        "local.role": "advisor",
        "local.account_activation_code":null
    }, (err, users) => {
        if (err) {
            console.error(err);
            res.sendStatus(300);
        } else {
            let advisorList = [];
            for (let index = 0; index < users.length; index++) {
                const advisorRecordTemplate = {
                    id: "",
                    avatar: "",
                    interest: "",
                    email: "",
                    displayName: ""
                };

                advisorRecordTemplate.id = users[index]._id;
                advisorRecordTemplate.avatar = users[index].local.avatar;
                advisorRecordTemplate.interest = users[index].interest_manual; //only show mannual inputed interest
                advisorRecordTemplate.email = users[index].local.email;
                advisorRecordTemplate.displayName = users[index].local.displayName;

                advisorList.unshift(advisorRecordTemplate);

                if (index == users.length - 1) {
                    // send advisor information as array
                    res.send({advisors: advisorList})
                }
            }
        }
    })
});

// used for demo, get question analysis for last asked questionFeeds
router.get('/get-last-question-analysis', (req, res) => {
    res.send({analysis: serverStatus.getLastQuestionAnalysis()});
});

module.exports = router;

// array prototype for get last item
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
};
