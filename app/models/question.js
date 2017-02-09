// app/models/QuestionAnswerPair.js

var mongoose = require('mongoose');
var appRoot = require('app-root-path');

mongoose.Promise = global.Promise;

var configDB = require.main.require(appRoot + '/config/database.js');
var conn = mongoose.createConnection(configDB.userDB_URL);

// define the schema for our user model
var questionSchema = mongoose.Schema({
    question_body: String,
    question_answer: String,
    question_concept: [
        {
            type:mongoose.Schema.Types.Mixed
        }
    ],
    question_entitie: [
        {
            type:mongoose.Schema.Types.Mixed
        }
    ],
    question_taxonomy: [
        {
            type:mongoose.Schema.Types.Mixed
        }
    ],
    question_keyword: [
        {
            type:mongoose.Schema.Types.Mixed
        }
    ],
    question_upload_mothod: String,
    question_upload_file_name: String,
    question_submitter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});

// create the model for users and expose it to our app
module.exports = conn.model('question', questionSchema);
