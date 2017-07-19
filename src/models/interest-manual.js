var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ManualInterest = new Schema({
  interest:[
      {
        "term": String,
        "value": Number
      }
  ]
},{ _id : false });

module.exports = mongoose.model('ManualInterest', ManualInterest);
