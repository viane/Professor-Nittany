var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Count = new Schema({
  count: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('HourlyClientCount', Count);
