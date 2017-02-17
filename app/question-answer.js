'use strict'

const appRoot = require('app-root-path');
const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');
const processAnswer = require('./process-answer');
const processQuestion = require('./process-question');
const serverStatus = require('./server-status');

module.exports.ask = function(user, input) {

    return new Promise(function(resolve, reject) {
        // transform question to human readable
        const userInput = processQuestion.humanizeString(input);

        // handled by conversation
        conversation.enterMessage(userInput).then(function(resultFromConversation) {
            // result from conversation
            // check if need further ask retrieve and rank
            if (false) {
                resolve(resultFromConversation);
            } else {
                // analysis the concept, keyword, taxonomy, entities of the question
                processQuestion.alchemyAnalysis(userInput).then(function(analysis) {

                    // now process the question and rephrase to AI readable
                    const questionObj = processQuestion.parseQuestionObj(userInput, analysis);

                    if (user) {
                        // log question to user DB
                        processQuestion.logUserQuestion(user, questionObj);

                        // update server question feeds
                        processQuestion.updateQuestionToServerFeeds(questionObj.body);
                    }

                    serverStatus.updateStatsFromQuestionObj(questionObj);

                    // ask retrieve and rank
                    retrieveRank.enterMessage(questionObj.body).then(function(resultFromRR) {
                        resolve(resultFromRR);
                    }).catch(function(err) {
                        throw err;
                        reject(err);
                    })

                }).catch(function(err) {
                    throw err;
                });

            }
        })
    });
};
