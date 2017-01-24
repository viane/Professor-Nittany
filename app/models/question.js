// app/models/question.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var configDB = require.main.require('./config/database.js');
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
