'use strict'
const appRoot = require('app-root-path');
const lda = require(appRoot + '/app/lda');

module.exports.logAnswers = function(input) {};

module.exports.final = function(answer, questionTopic) {

    // title should have 1 fields of topics
    // each answer should contain at least 2 fields of topics

    for (var index in answer.response.docs) {
        var doc = answer.response.docs[index]
        const title = doc.title;
        const body = doc.body;

        const titleTopic = lda.getTopic(title);
        const bodyTopic = lda.getTopic(body,2);

        doc.title_topic = titleTopic;
        doc.body_topic = bodyTopic;

        console.log(JSON.stringify(doc, null, 3));
    }

    // both anser and questionTopic is an array
    return new Promise(function(resolve, reject) {
        resolve(answer);
    })
};
