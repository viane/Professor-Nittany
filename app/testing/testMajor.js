'use strict'

var appRoot = require('app-root-path');

var lda = require('lda');

var express = require('express');
var UDRouter = express.Router();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var UDs = require('../models/utility-data');
UDRouter.use(bodyParser.json());

UDRouter.route('/')
.get(function(req,res,next){
  UDs.find({}, function (err,UDs){
    if (err) console.log(err);
    res.json(UDs);
  });
})
.post(function(req,res,next){
  UDs.create(req.body, function(err,ud){
    if (err) return next(err);

    console.log('utility-data created!');
    var id = ud._id;
    res.writeHead(200, {'Content-Type': 'text/plain'});

    res.end('Added the utility-data with id: ' + id);

  });

});

module.exports=UDRouter;
