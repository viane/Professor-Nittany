'use strict'

const appRoot = require('app-root-path');

const lda = require('lda');

module.exports.logAnswers = function(input) {};

module.exports.final = function(answer, questionTopic) {
  console.log(answer.response.docs[0]);
    for (var index in answer.response.docs) {
        var doc = answer.response.docs[index]
        const title = doc.title;
        const body = doc.body;

        let documents = body.match(/[^\.!\?]+[\.!\?]+/g);
        let result = lda(documents, 1, 10);
        console.log(result);

        documents = title.match(/[^\.!\?]+[\.!\?]+/g);
        result = lda(documents, 1, 10);
        console.log(result);
    }

    // both anser and questionTopic is an array
    return new Promise(function(resolve, reject) {
        resolve(answer);
    })
};
