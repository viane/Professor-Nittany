var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    OauthId: String,
    OauthToken: String,
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    major: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major'
    }],
    email:{
        type: String,
        required: true,
        unique: true
    },
    account_role:{
        type: String
    },
    question_history:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    interest: [{
        type: mongoose.Schema.Types.Mixed
    }],
    interest_mamual:[{
        type:mongoose.Schema.Types.Mixed
    }],
    inbox:[{
        type:mongoose.Schema.Types.Mixed
    }],
    personality_evaluation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PersonalityAssessement'
    },
    assessement:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessement'
    }],
    status:{
        type:String,
        default:"inactive"
    },
    activation_code: String
});

User.methods.getName = function() {
    return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);