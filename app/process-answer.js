'use strict'

// Not currently in use

const appRoot = require('app-root-path');

module.exports.logAnswers = function(input) {};

module.exports.final = function(answer) {

    // both anser and questionTopic is an array
    return new Promise(function(resolve, reject) {
        resolve(answer);
    })
};
