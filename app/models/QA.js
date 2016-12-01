// app/models/QA.js
var mongoose = require('mongoose');
var configDB = require.main.require('./config/database.js');
var conn = mongoose.createConnection(configDB.questionAnswerDB_URL);


// define the schema for our user model
var qaSchema = mongoose.Schema({
    record: {
        question: String,
        answer: String,
        tag: mongoose.Schema.Types.Mixed,
        property: mongoose.Schema.Types.Mixed //json structure
    }
});

// create the model for users and expose it to our app
module.exports = conn.model('questionAnswer', qaSchema);
