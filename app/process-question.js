'use strict'
const appRoot = require('app-root-path');
const lda = require('lda');
const string = require('string');

module.exports.humanizeString = function(inputQuestionString) {
    const humanizedInput = string(inputQuestionString).humanize().toString();
    return humanizedInput;
};

module.exports.getTopic = function (input) {
    const documents = input.match( /[^\.!\?]+[\.!\?]+/g );
    const result = lda(documents, 1, 10);
    return result;
};
