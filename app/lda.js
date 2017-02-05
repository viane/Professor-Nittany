// app/lda.js
// use to give topics of short string
'use strict'

const lda = require('lda');

module.exports.getTopic = function (input, categories, terms) {
    if(!categories) categories = 2;
    if(!terms) terms = 5;
    const documents = input.match( /[^\.!\?]+[\.!\?]+/g );
    const result = lda(documents, categories, terms);
    return result;
};
