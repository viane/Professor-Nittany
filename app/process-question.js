'use strict'
const appRoot = require('app-root-path');
const string = require('string');
const alchemyAPI = require(appRoot + '/app/alchemyAPI');
let User = require(appRoot + '/app/models/user');

module.exports.humanizeString = function(inputQuestionString) {
    const humanizedInput = string(inputQuestionString).humanize().toString();
    return humanizedInput;
};

module.exports.alchemyAnalysis = function(inputString) {
    alchemyAPI.getAnalysis(inputString).then(function(analysis) {
        return analysis;
    }).catch(function(err) {
        throw err;
        return null;
    });
};

module.exports.final = function(input, analysis) {
    let question = {};
    // each componment is an array of objects
    question.body = input;
    question.concept = analysis.concepts;
    question.entitie = analysis.entities;
    question.taxonomy = analysis.taxonomy;
    question.keyword = analysis.keywords;

    return input;
};

module.exports.logUserQuestion = function(reqUser, input) {
    const user_id = reqUser.id;
    const user_type = reqUser.type;

    let path = "";
    switch (user_type) {
        case "local":
            path = "local.ask_history";
            break;
        case "twitter":
            path = "twitter.ask_history";
            break;
        case "linkedin":
            path = "linkedin.ask_history";
            break;
        case "facebook":
            path = "facebook.ask_history";
            break;
        default:
            throw new Error("System try to log user question but user type is unexcepted");
            break;
    }

    //need update newest asked time if question already exists

    User.findOneAndUpdate({
        "_id": user_id,
        [path.user_question_body]: {
            $ne: input
        }
    }, {
        "$addToSet": {
            [path]: {
                user_question_body: input
            }
        }
    }, function(err, doc) {
        if (err) {
            throw err; // handle error;
        }
    });

}
