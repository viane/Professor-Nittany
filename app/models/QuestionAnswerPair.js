// app/models/QuestionAnswerPair.js
var mongoose = require('mongoose');
var appRoot = require('app-root-path');

mongoose.Promise = global.Promise;
var configDB = require(appRoot +'/config/database');
var conn = mongoose.createConnection(configDB.questionAnswerDB_URL);

// define the schema for our user model
var qaSchema = mongoose.Schema({
    record: {
        question: String,
        answer: String,
        tag: [String],
        creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }
});

// create the model for users and expose it to our app
module.exports = conn.model('QuestionAnswerPair', qaSchema);
