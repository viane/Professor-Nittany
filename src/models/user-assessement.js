var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comment = new Schema({
  postedBy: {
    type: mongoose.Schema.Type.ObjectId,
    ref: "User"
  },
  body: String
}, {timestamps: true});

var ProfileAssessement = new Schema({
  view_section: Array,
  question_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],
  personality_assessement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PersonalityAssessement'
  },
  personality_comment: [comment],
  interest: [
    {
      type: mongoose.Schema.Type.Mixed
    }
  ],
  interest_mamual: [
    {
      type: mongoose.Schema.Type.Mixed
    }
  ],
  interest_comment: [comment],
  introduction: String,
  introduction_comment: [comment],
  send_to: [
    {
      type: mongoose.Schema.Type.ObjectId,
      ref: "User"
    }
  ],
  submitter: {
    type: mongoose.Schema.Type.ObjectId,
    ref: "User"
  },
  status: {
    type: String
  }
}, {timestamps: true});

module.exports = mongoose.model('ProfileAssessement', ProfileAssessement);
