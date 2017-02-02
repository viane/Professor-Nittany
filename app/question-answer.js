'use strict'

const appRoot = require('app-root-path');
const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');
const processAnswer = require('./process-answer');
const processQuestion = require('./process-question');

module.exports.ask = function(user, input) {

    if (user) {
        processQuestion.logUserQuestion(user, input);
    }

    return new Promise(function(resolve, reject) {
        // transform question to human readable
        let userInput = processQuestion.humanizeString(input);
        // handled by conversation
        conversation.enterMessage(userInput).then(function(resultFromConversation) {
            // result from conversation
            // check if need further ask retrieve and rank
            if (false) {
                resolve(resultFromConversation);
            } else {
                // analysis the concept, keyword, taxonomy, entities of the question
                const analysis = processQuestion.alchemyAnalysis(userInput);
                if (analysis) {
                    // now process the question and rephrase to AI readable
                    userInput = processQuestion.final(userInput, analysis);
                }
                // ask retrieve and rank
                retrieveRank.enterMessage(userInput).then(function(resultFromRR) {
                    //analysis result from retrieve and rank, then resolve plain text
                    processAnswer.final(resultFromRR).then(function(finalAnswerResult) {
                        resolve(finalAnswerResult);
                    })
                })
            }
        })
    });
};
