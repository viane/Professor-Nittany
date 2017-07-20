var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var interest = new Schema({
  "term": String,
  "value": Number
}, {_id: false})

var Interest = new Schema({interest: [interest]});

module.exports = mongoose.model('Interest', Interest);
