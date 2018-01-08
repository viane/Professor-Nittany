var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Developer = new Schema({
  name:String,
  avatar:String,
  description:String,
  skill:[String],
  link:String,
  "main-title": [String]
})

module.exports = mongoose.model('Developer', Developer);
