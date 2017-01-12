// app/models/user.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var configDB = require.main.require('./config/database.js');
var conn = mongoose.createConnection(configDB.userDB_URL);

var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local: {
        email: String,
        password: String,
        displayName: String,
        avatar: { type: String, default: "./img/user.png" },
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        displayName: String,
        avatar: String,
        familyName: String,
        givenName: String,
        gender: String,
        ageMin: Number,
        interest: mongoose.Schema.Types.Mixed
    },
    twitter: {
        id: String,
        token: String,
        email: String,
        name: String,
        avatar: String,
        interest: mongoose.Schema.Types.Mixed
    },
    google: {
        id:String,
        displayName: String,
        familyName: String,
        givenName: String,
        language:String,
        email:String,
        gender:String,
        avatar:String,
        interest: mongoose.Schema.Types.Mixed
    },
    linkedin:{
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        email:String,
        avatar:String,

        interest: mongoose.Schema.Types.Mixed
    },
    instagram:{
        id: String,
        displayName: String,
        avatar:String,
        interest: mongoose.Schema.Types.Mixed
    },
    reddit:{
        id: String,
        displayName: String,
        avatar:String,
        interest: mongoose.Schema.Types.Mixed
    },
    amazon:{
        id: String,
        displayName: String,
        avatar:String,
        email:String,
        interest: mongoose.Schema.Types.Mixed
    },
    wechat:{
        id: String,
        displayName: String,
        avatar:String,
        interest: mongoose.Schema.Types.Mixed
    }
},{ strict: true });

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function(password) {
    var user = this;

    // hash the password
    bcrypt.hash(password, null, null, function(err, hash) {
        if (err)
            return next(err);

        user.local.password = hash;
    });

};

// create the model for users and expose it to our app
module.exports = conn.model('User', userSchema);
