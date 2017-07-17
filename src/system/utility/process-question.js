'use strict'
import formatter from './formatter';
const naturalLanguageUnderstanding = require('../watson/natural-language-understanding');


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

};

module.exports.logUserQuestion = function(user, question) {
    return new Promise((resolve, reject) => {
        resolve();
    });
}
