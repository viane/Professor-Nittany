// app/models/utility-data.js

'use strict'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const appRoot = require('app-root-path');
const configDB = require(appRoot + '/config/database.js');

const conn = mongoose.createConnection(configDB.userDB_URL);

// define the schema for our user model
UDSchema = mongoose.Schema({
    file-name:{
        type:String
    },
    degrees:[{     degree-name:{
                        type:String
                   },
                   degree-level: {
                        type:String
                   },
                   degree-option:{
                        type:String
                   }
    }]
});

// create the model for users and expose it to our app
module.exports = conn.model('Utility-data', UDSchema);
