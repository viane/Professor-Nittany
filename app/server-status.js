'use strict'

const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const appRoot = require('app-root-path');
const serverStatusPath = '/config/server-status.json';

let questionFeeds = [];

module.exports.updateStatsFromQuestionObj = function(questionObj) {
    return null;
};

// get recent questionFeeds
module.exports.getRecentAskedQuestions = () => {
    console.log("Client requesting question feeds from server, current question feeds is ", questionFeeds);
    return questionFeeds;
};

// load question to server when server is starting
// return a promise
module.exports.initQuestionFeeds = () => {
    return new Promise((resolve, reject) => {
        loadJsonFile(appRoot + serverStatusPath).then(json => {
            questionFeeds = json.recent_asked_question;

            // write the question feeds to disk every 1 hour
            setInterval(writeQuestionFeeds().catch((err) => {
                throw err
            }), 3600000);

            resolve();
        }).catch((err) => {
            throw err;
            reject(err);
        })
    });
};

// update questionFeeds
module.exports.updateRecentAskedQuestions = (Question) => {
    console.log("adding ", Question, " to server question feeds");
    // 3 cases, the question is new, already in the list but still asked recently, already asked but long time ago
    if (!questionFeeds.includes(Question)) {
        // server only store max 50 of recently asked questions
        if (questionFeeds.length >= 50) {
            questionFeeds.shift();
        }
    } else {
        // delete old question in feed
        const oldIndex = questionFeeds.indexOf(Question);
        questionFeeds.slice(oldIndex, 1);
    }
    questionFeeds.unshift(Question);
};

// write current questionFeeds to disk for maintianess etc
// return a promise
const writeQuestionFeeds = () => {
    return new Promise((resolve, reject) => {

        // read last copy from disk

        loadJsonFile(appRoot + serverStatusPath).then(json => {

            json.recent_asked_question = questionFeeds;

            writeJsonFile(appRoot + serverStatusPath, json).then(() => {
                resolve();
            }).catch((err) => {
                throw err;
                reject(err);
            })

        }).catch((err) => {
            throw err;
            reject(err);
        })

    })
};
