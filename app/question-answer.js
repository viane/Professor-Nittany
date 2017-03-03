'use strict'

const appRoot = require('app-root-path');
const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');
const processAnswer = require('./process-answer');
const processQuestion = require('./process-question');
const serverStatus = require('./server-status');
const stringChecking = require('./utility-function/string-checking');

module.exports.ask = function(user, input) {

    return new Promise(function(resolve, reject) {

        // if user input is less than 3 words
        if (stringChecking.countWords(input) <= 2) {
            resolve({
                response: {
                    docs: [
                        {
                            title: "Minimum input restriction",
                            body: "Hi, your question is little bit short for me to give you a good answer, try be more specific (add few more words)."
                        }
                    ]
                }
            })
        }

        // mannual preprocessing
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
                        // log question object to user DB
                        processQuestion.logUserQuestion(user, questionObj);

                        // update server question feeds with only user question string
                        processQuestion.updateQuestionToServerFeeds(questionObj.body);
                    }

                    serverStatus.updateStatsFromQuestionObj(questionObj);

                    // ask retrieve and rank
                    // testing answer accuracy with 3 input mode:
                    //                            question.body => user's original input
                    //                            question.AI_Read_Body => AI weight based readable string
                    //                            question.body + question.AI_Read_Body => hyper
                    retrieveRank.enterMessage(questionObj.body + questionObj.AI_Read_Body).then(function(resultFromRR) {
                        if (resultFromRR.response.numFound === 0) {
                            // no answer was found in retrieve and rank
                            resolve({
                                response: {
                                    docs: [
                                        {
                                            title: "No answer found",
                                            body: "Sorry I can't find any answer for this specific question, please ask a different question."
                                        }
                                    ]
                                }
                            })
                        } else {
                            resolve(resultFromRR);
                        }
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
