'use strict'

const lda = require('lda');

module.exports.getTopic = function (input) {
  const documents = input.match( /[^\.!\?]+[\.!\?]+/g );
  const result = lda(documents, 2, 5);
  console.log("2 topics, each topic 5 terms:\n");
  // For each topic.
  for (var i in result) {
      var row = result[i];
      console.log('Topic ' + (parseInt(i) + 1));

      // For each term.
      for (var j in row) {
          var term = row[j];
          console.log(term.term + ' (' + term.probability + '%)');
      }

      console.log('');
  }
};
