'use strict'

var appRoot = require('app-root-path');

var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
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

var UDs = require('../models/major-list');
router.use(bodyParser.json());
var user= require('../models/user');

router.route('/major-list')
.get(function(req,res,next){
  UDs.find({"utility_type": "degree"}, function (err,UDs){
    if (err) console.log(err);
    res.json(UDs);
  });
})
.post(function(req,res,next){
  for(let i=0; i<req.body.input.length;i++){
    let major = new UDs({
       "degree_name" : req.body.input[i].degree_name,
       "degree_level": req.body.input[i].degree_level
    })
    if(req.body.input[i].degree_option){
      major.degree_option = req.body.input[i].degree_option;
    }
    major.save(function(err,ud){
      if (err) console.log(err);
    });
  }
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Added the utility-data');
})
.delete(function(req,res,next){
  UDs.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

router.route('/user')
.get(function(req,res,next){
  user.find({}, function (err,users){
    if (err) console.log(err);
    res.json(users);
  });
})
.post(function(req,res,next){
  user.create(req.body, function(err,ud){
    if (err) return next(err);

    console.log('utility-data created!');
    var id = ud._id;
    res.writeHead(200, {'Content-Type': 'text/plain'});

    res.end('Added the utility-data with id: ' + id);
  });

})
.delete(function(req,res,next){
  user.remove({ "local.last_name":"Wang"}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});


module.exports = router
