'use strict'
const appRoot = require('app-root-path');
const string = require('string');
const alchemyAPI = require(appRoot + '/app/alchemyAPI');
const serverStatus = require(appRoot + '/app/server-status');
let User = require(appRoot + '/app/models/user');

module.exports.humanizeString = function(inputQuestionString) {
    const humanizedInput = string(inputQuestionString).humanize().toString();
    return humanizedInput;
};

module.exports.alchemyAnalysis = function(inputString) {
    return new Promise(function(resolve, reject) {
        alchemyAPI.getAnalysis(inputString).then(function(analysis) {
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

    // this function is the core algorithm for preprocessing, which should be updated and optimized mostly

    let AI_Read_Vector = "";

    AI_Read_Vector = AI_Read_Vector.concat(convertPerspectsToAIReadable("concept", analysis.concepts));

    AI_Read_Vector = AI_Read_Vector.concat(convertPerspectsToAIReadable("entity", analysis.entities));

    AI_Read_Vector = AI_Read_Vector.concat(convertPerspectsToAIReadable("taxonomy", analysis.taxonomy));

    AI_Read_Vector = AI_Read_Vector.concat(convertPerspectsToAIReadable("keyword", analysis.keywords));

    question.AI_Read_Body = AI_Read_Vector;

    return question;
};

module.exports.updateQuestionToServerFeeds = (question) => {
    serverStatus.updateRecentAskedQuestions(question);
};

module.exports.logUserQuestion = function(reqUser, questionObj) {
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
            throw err; // handle error;
        }
    });

}

const convertPerspectsToAIReadable = (perspect_type, content) => {
    let AI_Read_String = "";

    // reference Doc/markdown/alchemyAPI response example.md for example output of eac perspect

    switch (perspect_type) {
        case "concept":
            content.map((perspect) => {
                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = Math.round(perspect.relevance * 10);

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text + " ");
                }
            });
            break;

        case "keyword":
            content.map((perspect) => {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = Math.round(perspect.relevance * 10);

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text + " ");
                }
            });
            break;

        case "entity":
            content.map((perspect) => {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = perspect.count;

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text + " ");
                }
            });
            break;

        case "taxonomy":
            content.map((perspect) => {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = perspect.count;

                // multiple this concept to the weight ( make this concept repeat wright times)

                const wordSplitBySplash = perspect.label.split("/");
                const taxonomy = wordSplitBySplash.pop();

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(taxonomy + " ");
                }
            });
            break;
    }

    return AI_Read_String;
}
