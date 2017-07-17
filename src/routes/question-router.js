var express = require('express');
var questionRouter = express.Router();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var Questions = require('../models/question');
var config = require('../config');
var Verify = require('./verify');
var watson = require('watson-developer-cloud');

var retrieve_and_rank=watson.retrieve_and_rank(config.watson.retrieve_and_rank);
var solrClient = retrieve_and_rank.createSolrClient(config.watson.rrparams);
var qs = require('qs');

questionRouter.use(bodyParser.json());

//API get asked question from mongodb: get /questions
questionRouter.route('/')
.get(Verify.verifyOrdinaryUser, function(req,res,next){
    Questions.find({"question_submitter":req.decoded._id})
        .populate('question_submitter')
        .exec(function (err, question) {
        if (err) return next(err);
        res.json(question);
    });
})

//API send new question to retrive-rank: post /questions
.post(Verify.verifyOrdinaryUser,function(req,res,next){
    solrClient = retrieve_and_rank.createSolrClient(config.watson.rrparams);
    var newQuestion = new Questions();
    newQuestion.question_body = req.body.question;
    newQuestion.question_submitter = req.decoded._id;
    
    var query = qs.stringify({q:newQuestion.question_body, ranker_id:config.watson.ranker_id, rows: 3, fl: 'id,answer_id,score,ranker.confidence,title,body'})
    
    solrClient.get('fcselect', query, function(err, searchResponse){
        if(err) return next(err);
        console.log(searchResponse.response);
        for(let i=0; i<searchResponse.response.docs.length; i++){
            newQuestion.question_answer.push(searchResponse.response.docs[i].body);
        }
        newQuestion.save(function(err,resp){
            if (err) return next(err);
            res.json(resp);
        })
    });


});

questionRouter.route('/:dishId')
.get(function(req,res,next){
	questions.findById(req.params.dishId)
     .populate('comments.postedBy')
     .exec(function (err, dish) {
        if (err) return next(err);
        res.json(dish);
    });

})

.put(Verify.verifyAdminUser,function(req,res,next){
	questions.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {
        new: true
    }, function (err, dish) {
        if (err) return next(err);
        res.json(dish);
    });

})

.delete(Verify.verifyAdminUser,function(req,res,next){
	questions.findByIdAndRemove(req.params.dishId, function (err, resp) {        
		if (err) return next(err);
        res.json(resp);
    });

});

questionRouter.route('/:dishId/comments')
//.all(Verify.verifyOrdinaryUser) the same funtionality
.get(function (req, res, next) {
    questions.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function (err, dish) {
        if (err) return next(err);
        res.json(dish.comments);
    });
})

.post(Verify.verifyOrdinaryUser,function (req, res, next) {
    questions.findById(req.params.dishId, function (err, dish) {
        if (err) return next(err);
        
        req.body.postedBy = req.decoded._id;

        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) return next(err);
            console.log('Comments Added!');
            res.json(dish);
        });
    });
})

.delete(Verify.verifyAdminUser,function (req, res, next) {
    questions.findById(req.params.dishId, function (err, dish) {
        if (err) return next(err);
        for (var i = (dish.comments.length - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save(function (err, result) {
            if (err) return next(err);
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

questionRouter.route('/:dishId/comments/:commentId')
.get(function (req, res, next) {
    questions.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function (err, dish) {
        if (err) return next(err);
        res.json(dish.comments.id(req.params.commentId));
    });
})

.put(Verify.verifyOrdinaryUser,function (req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    questions.findById(req.params.dishId, function (err, dish) {
        if (err) return next(err);
        dish.comments.id(req.params.commentId).remove();
        req.body.postedBy = req.decoded._id;
        dish.comments.push(req.body);
        dish.save(function (err, dish) {
            if (err) return next(err);
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})

.delete(Verify.verifyOrdinaryUser,function (req, res, next) {
    questions.findById(req.params.dishId, function (err, dish) {
        if (dish.comments.id(req.params.commentId).postedBy
           != req.decoded._id) {
            var err = new Error('You are not authorized to perform this operation!');
            err.status = 403;
            return next(err);
        }
        dish.comments.id(req.params.commentId).remove();
        dish.save(function (err, resp) {
            if (err) return next(err);
            res.json(resp);
        });
    });
});


module.exports=questionRouter;