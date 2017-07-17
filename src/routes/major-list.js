var express = require('express');
var majorListRouter = express.Router();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var UDs = require('../models/major-list');

var Verify = require('./verify');

majorListRouter.route('/')
.get(function(req,res,next){
	console.log(req);
  UDs.find({"utility_type": "degree"}, function (err,data){
    if (err) console.log(err);
    res.json(data);
  });
})
.post(function(req,res,next){
  console.log(req);
  for(var i=0; i<req.body.input.length;i++){
    var major = new UDs({
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

module.exports=majorListRouter;