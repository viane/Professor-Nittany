'use strict'
const appRoot = require('app-root-path');
const string = require('string');
const serverStatus = require(appRoot + '/app/server-status');
const formatter = require(appRoot + '/app/utility-function/formatter');
let User = require(appRoot + '/app/models/user');
const naturalLanguageUnderstanding = require(appRoot + '/app/natural-language-understanding');

module.exports.humanizeString = function(inputQuestionString) {
    const humanizedInput = string(inputQuestionString).humanize().toString().trim();
    return humanizedInput;
};

module.exports.NLUAnalysis = function(inputString) {
    return new Promise(function(resolve, reject) {
        naturalLanguageUnderstanding.getAnalysis(inputString).then(function(analysis) {
            resolve(analysis);
        }).catch(function(err) {
            throw err;
            reject(err);
        });
    });

};

module.exports.parseQuestionObj = function(input, analysis) {
    let question = {};
    // each componment is an array of objects
    question.body = input;

    // add AI readable section that is transfromed from concepts/entities/taxonomy/keywords into one vector

    let AI_Read_Vector = "";

    AI_Read_Vector = AI_Read_Vector.concat(formatter.convertPerspectsToAIReadable("concept", analysis.concepts));

    AI_Read_Vector = AI_Read_Vector.concat(formatter.convertPerspectsToAIReadable("entity", analysis.entities));

    AI_Read_Vector = AI_Read_Vector.concat(formatter.convertPerspectsToAIReadable("keyword", analysis.keywords));

    question.AI_Read_Body = AI_Read_Vector;
    return question;
};

module.exports.updateQuestionToServerFeeds = (question) => {
    serverStatus.updateRecentAskedQuestions(question);
};

module.exports.logUserQuestion = function(reqUser, questionObj) {
    return new Promise((resolve, reject) => {
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
                $ne: questionObj.body
            }
        }, {
            "$addToSet": {
                [path]: {
                    "question_body": questionObj.body
                }
            }
        }, function(err, doc) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(doc);
        });
    });
}
