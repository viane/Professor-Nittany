'use strict';
// app/models/QuestionAnswerPair.js
// user for admin upload questions from either single submission or file submission
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

// define the schema for our question model
var dominatedTermsSchema = new Schema({
    terms:[{
        text:String,
        count:Number
    }],
    termsText: [{
        type:String
    }]
}, {
    timestamps: true
});

// create the model for users and expose it to our app
module.exports = mongoose.model('dominatedTerms', dominatedTermsSchema);
