'use strict';
// app/models/QuestionAnswerPair.js
// user for admin upload questions from either single submission or file submission
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

// var answerSchema = new Schema({
//     body: String,
//     title: String,
//     confidence: String,
//     score: String,
//     feature: [{
//         concept: [
//             {
//                 type:mongoose.Schema.Types.Mixed
//             }
//         ],
//         entitie: [
//             {
//                 type:mongoose.Schema.Types.Mixed
//             }
//         ],
//         taxonomy: [
//             {
//                 type:mongoose.Schema.Types.Mixed
//             }
//         ],
//         keyword: [
//             {
//                 type:mongoose.Schema.Types.Mixed
//             }
//         ]
//     }]
// }, {
//     timestamps: true
// });

// define the schema for our question model
var questionSchema = new Schema({
    body: String,
    feature: [{
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
    submitter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Question', questionSchema);
