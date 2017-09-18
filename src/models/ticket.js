var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ticket = new Schema({
  title: String,
  comment: String,
  submitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    default: "open"
  }
}, {timestamps: true});

module.exports = mongoose.model('Ticket', Ticket);
