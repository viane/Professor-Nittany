var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
  password: String,
  facebook_OauthId: String,
  linkedin_OauthId: String,
  twitter_OauthId: String,
  google_OauthId: String,
  OauthToken: String,
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  psu_id:{
    type: String,
    default:null
  },
  major: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Major'
    }
  ],
  email: {
    type: String,
    required: true,
    unique: true
  },
  account_role: {
    type: String
  },
  // question_history: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: 'Question'
  //   }
  // ],
  interest: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Interest'
  },
  interest_manual: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'ManualInterest'
  },
  inbox: [
    {
      type: mongoose.Schema.Types.Mixed
    }
  ],
  personality_evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalityAssessement'
  },
  assessement: [
    {
      refID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfileAssessement',
        default: null
      }
    }
  ],
  status: {
    type: String,
    default: "inactive"
  },
  activation_code:  {
    type: String,
    default: "xxxxxxx"
  },
  resetPasswordToken:{
    type: String,
    default: null
  },
  resetPasswordExpires:{
    type: Date,
    default: null
  }
});

User.methods.getName = function() {
  return (this.firstname + ' ' + this.lastname);
};

User.plugin(passportLocalMongoose, {'usernameField': 'email'});

module.exports = mongoose.model('User', User);
