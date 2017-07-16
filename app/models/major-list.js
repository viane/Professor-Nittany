// app/models/utility-data.js

'use strict'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const appRoot = require('app-root-path');
const configDB = require(appRoot + '/config/database.js');

const conn = mongoose.createConnection(configDB.userDB_URL);

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
module.exports = conn.model('Major', MajorSchema,'utility-data');
