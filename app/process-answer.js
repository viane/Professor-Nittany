'use strict'
const appRoot = require('app-root-path');
const lda = require(appRoot + '/app/lda');

module.exports.logAnswers = function(input) {};

module.exports.final = function(answer) {
  
    // both anser and questionTopic is an array
    return new Promise(function(resolve, reject) {
        resolve(answer);
    })
};
