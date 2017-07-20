var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interest = new Schema({
  "term": String,
  "value": Number
}, {_id: false})

var ManualInterest = new Schema({interest: [interest]});

module.exports = mongoose.model('ManualInterest', ManualInterest);
