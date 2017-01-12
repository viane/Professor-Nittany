const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');

module.exports.ask = function(input) {
    return new Promise(function(resolve, reject) {
        conversation.enterMessage(input).then(function(result) {
            // analysis result from conversation
            if (false) { // no need further ask...
                resolve(result);
            } else {
                // ask retrieve and rank
                retrieveRank.enterMessage(result).then(function(result2) {
                    resolve(result2);
                })
            }
        })
    });

};
