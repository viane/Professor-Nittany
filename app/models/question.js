// app/models/question.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var appRoot = require('app-root-path');
var configDB = require.main.require(appRoot+'/config/database.js');
var conn = mongoose.createConnection(configDB.userDB_URL);

// define the schema for our user model
var qestionSchema = mongoose.Schema({
    body: String,
    keyword:[{word:{type:String}, confidence:{type:Number}}],
    concept:[{word:{type:String}, confidence:{type:Number}}],
    taxonomy:[{word:{type:String}, confidence:{type:Number}}],
    inputFileName:String,
    submitter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

// create the model for users and expose it to our app
module.exports = conn.model('Question', qestionSchema);
