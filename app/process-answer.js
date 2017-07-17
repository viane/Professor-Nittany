'use strict'

// Not currently in use

module.exports.logAnswers = function(input) {};

module.exports.final = function(answer) {

    // both anser and questionTopic is an array
    return new Promise(function(resolve, reject) {
        resolve(answer);
    })
};
