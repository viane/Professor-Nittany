var express = require('express');
var majorListRouter = express.Router();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var UDs = require('../models/major-list');

const Verify = require('../system/utility/verify');

majorListRouter.route('/')
.get(function(req,res,next){
	// console.log(req);
  UDs.find({}, function (err,data){
    if (err) console.log(err);
    res.json(data);
  });
})
.post(function(req,res,next){
  console.log(req);
  var promisesArray = [];
  for(var i=0; i<req.body.input.length;i++){
    promisesArray.push(new Promise(function(resolve,reject){
      var major = new UDs({
         "degree_name" : req.body.input[i].degree_name,
         "degree_level": req.body.input[i].degree_level
      });
      major.save(function(err,ud){
        if (err) reject(err);
        resolve(ud);
      });
    }));
  }
  Promise.all(promisesArray)
  .then((data)=>{
    console.log(data);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Added the utility-data');
  })
  .catch((err)=>{
    res.status(200).json({
      err:err
    });
  });
})
.delete(function(req,res,next){
  UDs.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

module.exports=majorListRouter;
