'use strict'
const appRoot = require('app-root-path');
const string = require('string');

module.exports.humanizeString = function(inputQuestionString) {
    const humanizedInput = string(inputQuestionString).humanize().toString();
    return humanizedInput;
};
