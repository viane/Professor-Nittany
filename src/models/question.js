'use strict';
// app/models/QuestionAnswerPair.js
// user for admin upload questions from either single submission or file submission
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

// define the schema for our user model
var questionSchema = new Schema({
    question_body: String,
    question_feature: [{
        concept: [
            {
                type:mongoose.Schema.Types.Mixed
            }
        ],
        entitie: [
            {
                type:mongoose.Schema.Types.Mixed
            }
        ],
        taxonomy: [
            {
                type:mongoose.Schema.Types.Mixed
            }
        ],
        keyword: [
            {
                type:mongoose.Schema.Types.Mixed
            }
        ]
    }],
    question_submitter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Question', questionSchema);
