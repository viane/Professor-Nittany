'use strict'

const lda = require('lda');

module.exports.getTopic = function (input, categories = 1, terms= 10) {
    const documents = input.match( /[^\.!\?]+[\.!\?]+/g );
    const result = lda(documents, categories, terms);
    return result;
};
