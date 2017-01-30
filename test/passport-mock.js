var passport = require('passport');
var StrategyMock = require('./strategy-mock');
const appRoot = require('app-root-path');
const User = require(appRoot + '/app/models/user.js');

var verifyFunction = function(req, email, password, done) {
    console.log("Verifying.");
    User.findOne({
        'local.email': email
    }, function(err, user) {
            if (err) {
                //console.log("error.");
                return done(err);
            }
            if (!user) {
               // console.log("No user found.");
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }
            if (!user.validPassword(password)) {
               // console.log("Wrong password.");
                return done(null, false, req.flash('loginMessage', 'Wrong password.'));
            }
           // console.log("clear");
            return done(null, user);
        });
};

module.exports = function(app, options) {

    passport.serializeUser(function(user, done) {
        console.log("Serializing.");
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        const mongoose = require('mongoose');
        console.log("==============================================\nDeserializing User...");
        console.log("Try to deserialize user ->");
        console.log(id);
        console.log("is user id valid? ->");
        console.log(mongoose.Types.ObjectId.isValid(id.toString()));
        console.log("==============================================");

        User.findById(mongoose.Types.ObjectId(id)).then(function(user) {
            done(null, user);
        }).catch(function(err) {
            done(err, null);
        });
    });

	passport.use(new StrategyMock(options, verifyFunction));

	app.post('/mock/login', passport.authenticate('mock'));


};
