'use strict'

const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const appRoot = require('app-root-path');
const serverStatusPath = '/config/server-status.json';

// store question strings
let questionFeeds = [];

// store advisor IDs
let advisorList = [];

module.exports.updateStatsFromQuestionObj = function(questionObj) {
    return null;
};

// get recent questionFeeds
module.exports.getRecentAskedQuestions = () => {
    return questionFeeds;
};

// get recent advisorList
module.exports.getAdvisorList = () => {
    return advisorList;
};

// get recent advisorList
module.exports.addNewToAdvisorLists = (advisorID) => {
    return new Promise(function(resolve, reject) {
        advisorList.unshift(advisorID);
        // update disk copy
        backupAdvisorList().then(() => {
            resolve();
        }).catch((err) => {
            throw err;
            reject(err);
        })
    });

};

// load advisor list to server when server is starting
// return a promise
module.exports.initAdvisorList = () => {
    return new Promise((resolve, reject) => {
        loadJsonFile(appRoot + serverStatusPath).then(json => {
            advisorList = json.advisor_list;
            // write the current advisor list to disk every 1 hour
            setInterval(() => {
                backupAdvisorList().catch((err) => {
                    throw err
                })
            }, 3600000);
            resolve();
        }).catch((err) => {
            throw err;
            reject(err);
        })
    });
};

// load question to server when server is starting
// return a promise
module.exports.initQuestionFeeds = () => {
    return new Promise((resolve, reject) => {
        loadJsonFile(appRoot + serverStatusPath).then(json => {
            questionFeeds = json.recent_asked_question;
            // write the question feeds to disk every 1 hour
            setInterval(() => {
                backupQuestionFeeds().catch((err) => {
                    throw err
                })
            }, 3600000);
            resolve();
        }).catch((err) => {
            throw err;
            reject(err);
        })
    });
};

// update questionFeeds
module.exports.updateRecentAskedQuestions = (Question) => {
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

// write current questionFeeds to disk
// return a promise
const backupQuestionFeeds = () => {
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

// write current advisor list to disk
// return a promise
const backupAdvisorList = () => {
    return new Promise((resolve, reject) => {
        // read last copy from disk
        loadJsonFile(appRoot + serverStatusPath).then(json => {
            json.advisor_list = advisorList;
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
