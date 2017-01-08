// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    _id: String,
    local: {
        email: String,
        password: String,
        displayName: String,
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
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    twitter: {
        id: String,
        token: String,
        email: String,
        name: String,
        avatar: String,
        role: { type: String, default: "student" },
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
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    linkedin:{
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        email:String,
        avatar:String,
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    instagram:{
        id: String,
        displayName: String,
        avatar:String,
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    reddit:{
        id: String,
        displayName: String,
        avatar:String,
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    amazon:{
        id: String,
        displayName: String,
        avatar:String,
        email:String,
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    },
    wechat:{
        id: String,
        displayName: String,
        avatar:String,
        role: { type: String, default: "student" },
        interest: mongoose.Schema.Types.Mixed
    }
});

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
module.exports = mongoose.model('User', userSchema);
