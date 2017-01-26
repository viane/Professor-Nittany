const string = require('string');

module.exports.processString = function(inputQuestionString) {
    const humanizedInput = string(inputQuestionString).humanize().toString();

    return humanizedInput;
};
