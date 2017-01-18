const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');
const processAnswer = require('./process-answer');

const string = require('string');

module.exports.ask = function(input) {
    const humanizedInput = string(input).humanize().toString();
    return new Promise(function(resolve, reject) {
        conversation.enterMessage(humanizedInput).then(function(resultFromConversation) {
            // analysis result from conversation
            if (false) { // no need further ask...
                resolve(resultFromConversation);
            } else {
                // ask retrieve and rank
                retrieveRank.enterMessage(humanizedInput).then(function(resultFromRR) {
                    //analysis result from retrieve and rank, then resolve plain text
                    processAnswer.doNothing(resultFromRR).then(function(finalAnswerResult) {
                        resolve(finalAnswerResult);
                    })
                })
            }
        })
    });

};
