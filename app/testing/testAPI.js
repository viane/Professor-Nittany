'use strict'

var appRoot = require('app-root-path');

var express = require('express');

var router = express.Router();

var lda = require('lda');

router.post('/analysis-topic', function(req, res){
  const input = req.body.content;
  console.log(input);
  if (input.length>0) {
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
  }

  res.sendStatus(200);
});

module.exports = router
