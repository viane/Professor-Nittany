var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Assessement = new Schema({
    description_content:String,
    evaluation:{
        type: mongoose.Schema.Types.Mixed
    }
},
{
    timestamps: true
});


module.exports = mongoose.model('PersonalityAssessement', Assessement);
