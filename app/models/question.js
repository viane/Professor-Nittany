// app/models/question.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const appRoot = require('app-root-path');
var configDB = require.main.require(appRoot + '/config/database.js');
var conn = mongoose.createConnection(configDB.questionDB_URL);

// define the schema for our user model
var qestionSchema = mongoose.Schema({
    body: String,
    keyword:[String],
    concept:[String],
    taxonomy:[String],
    inputFileName:String
});

// create the model for users and expose it to our app
module.exports = conn.model('Question', qestionSchema);
