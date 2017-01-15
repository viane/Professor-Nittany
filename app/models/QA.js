// app/models/QA.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var configDB = require.main.require('./config/database.js');
var conn = mongoose.createConnection(configDB.questionAnswerDB_URL);

// define the schema for our user model
var qaSchema = mongoose.Schema({
    record: {
        question: String,
        answer: String,
        tag: [String],
        asked_user_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
    }
});

// create the model for users and expose it to our app
module.exports = conn.model('questionAnswer', qaSchema);
