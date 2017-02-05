// app/file-to-questionDB.js
// take input text file, batch process questions line by line to question DB
'use strict'

var appRoot = require('app-root-path');

var express = require('express');

var router = express.Router();

var busboy = require('connect-busboy');

const fs = require('fs');

var stream = require('stream'),
    es = require('event-stream');

const Question = require(appRoot + '/app/models/question');

// router.post('/upload-by-text-file', function (req, res, next) {
//   var question = new Question();
//   question.body = req.body.text;
//   question.inputFileName = req.body.fileName;
//   question.submitter = req.user._id;
//
//   // use alchemyAPI to get rest propreties to record;
//   question.keyword = [{}];
//   question.concept = [{}];
//   question.taxonomy = [{}];
//
//   question.save()
//   .then(function(savedQuestion) {
//       res.send({type: 'success', information: 'Successfully saved question.', question: savedQuestion});
//   })
//   .catch(function (err) {
//       throw err
//       res.send({type: 'error', information: err});
//   })
// })

router.post('/upload-by-text-file', busboy({
    limits: {
        fileSize: 2 * 1024 * 1024
    }
}), function(req, res, next) {
    if (!req.busboy)
        return next('route');

    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        fstream = fs.createWriteStream(appRoot + '/app/question-file/' + filename);
        file.pipe(fstream);
        fstream.on('close', function() {
            console.log("Finished writting admin upload question files");
            // for each line in document
            fs.createReadStream(appRoot + '/app/question-file/' + filename).pipe(es.split()).pipe(es.mapSync(function(line) {
                // do things with line here
                // console.log(line);
                // go thru alchemyAPI
                // get body, keyword, concept, taxonomy
                // Store in DB
            }).on('error', function(err) {
                throw err;
                console.log('Error while reading file.');
            }).on('end', function() {
                res.send().status(200);
            }));
        });
    });
})

module.exports = router
