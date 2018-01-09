var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Developer = new Schema({
  name:{type:String, required: true, index: true, unique: true},
  avatar:String,
  description:String,
  skill:[String],
  link:String,
  "main-title": [String]
})

module.exports = mongoose.model('Developer', Developer);
