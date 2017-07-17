// app/models/utility-data.js

'use strict'

const mongoose = require('mongoose');
//mongoose.Promise = global.Promise;

// define the schema for our user model
const MajorSchema = mongoose.Schema({
        "degree_name":{
            type:String
        },
        "degree_level": {
            type:String
        },
        "degree_option":{
            type:String,
            default: null
        },
        "utility_type":{
            type:String,
            default: "degree"
        }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Major', MajorSchema);
