// config/passport.js
'use strict'

var validator = require("email-validator");
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var InstagramStrategy = require("passport-instagram").Strategy;
var RedditStrategy = require("passport-reddit").Strategy;
var AmazonStrategy = require("passport-amazon").Strategy;
var WechatStrategy = require("passport-wechat").Strategy;

var appRoot = require('app-root-path');

const serverStatus = require(appRoot + '/app/server-status');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const serverStatusPath = '/config/server-status.json';

// load up the user model
var User = require(appRoot + '/app/models/user');

// load the auth variables
var configAuth = require(appRoot + '/config/auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        const mongoose = require('mongoose');
        User.findById(mongoose.Types.ObjectId(id)).then(function(user) {
            done(null, user);
        }).catch(function(err) {
            done(err, null);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) { // callback with email and password from our form
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
            'local.email': email.toLowerCase()
        }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) {
                return done(err, false, req.flash('signupMessage', err))
            }

            // if no user is found, return the message
            if (!user) {
                return done("Can't find any user with this email", false, req.flash('signupMessage', 'Cant find any user with this email')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!user.validPassword(password)) {
                return done("Password incorrect", false, req.flash('signupMessage', 'Password incorrect')); // req.flash is the way to set flashdata using connect-flash
            }
            // all is well, return successful user
            return done(null, user);
        });
    }));

    // =========================================================================
    // LOCAL SIGNUP =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, email, password, done) {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({
            'local.email': req.body.email
        }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) {
                return done(err, false, req.flash('signupMessage', err));
            } else {
                //check if email is vaild
                if (validator.validate(req.body.email)) {
                    // if user record is found, return the message
                    if (user) {
                        return done("Email already registered", false, req.flash('signupMessage', 'Email already registered')); // req.flash is the way to set flashdata using connect-flash
                    } else {
                        //create new user
                        var newUser = new User();

                        newUser.type = "local";

                        // set up account information
                        if (req.body.account_role === "Student") {
                            newUser.local.role = "student";
                        }

                        if (req.body.account_role === "Advisor") {
                            newUser.local.role = "advisor";
                        }

                        if (req.body.account_role === "Admin") {
                            newUser.local.role = "admin";
                        }

                        newUser.local.email = req.body.email; // facebook can return multiple emails so we'll take the first
                        newUser.hashPassword(password); //need-fix password input has to pass BCrypt hash, otherwise login will fail
                        newUser.local.first_name = req.body.first_name;
                        newUser.local.last_name = req.body.last_name;
                        newUser.local.displayName = req.body.first_name + " " + req.body.last_name;

                        // save our user to the database
                        newUser.save(function(err, newRecord) {
                            if (err) {
                                throw err;
                                return done(err, false, req.flash('signupMessage', err));
                            } else {
                                // if successful
                                return done(null, newUser);
                            }
                        })
                    }
                } else {
                    return done("Email not vaild", false, req.flash('signupMessage', 'Email not vaild'));
                }
            }
        });
    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        // pull in our app id and secret from our auth.js file
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: [
            'id',
            'displayName',
            'picture.type(large)',
            'emails',
            'age_range',
            'gender',
            'locale',
            'link',
            'about',
            'education',
            'hometown',
            'location',
            'last_name',
            'first_name'
        ] //custmize what to retrive from facebook, additional premission might required from facebook

    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        console.log(JSON.stringify(profile));
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their facebook id
            User.findOne({
                'facebook.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.type = "facebook";
                    newUser.facebook.id = profile.id; // set the users facebook id
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user
                    newUser.facebook.displayName = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.facebook.familyName = profile.name.familyName;
                    newUser.facebook.givenName = profile.name.givenName;
                    newUser.facebook.gender = profile.gender;
                    newUser.facebook.ageMin = profile._json.age_range.min;
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    newUser.facebook.avatar = profile.photos[0].value;
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    // =========================================================================
    // TWITTER ================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
        // pull in our app id and secret from our auth.js file
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL,
        userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
        includeEmail: true,
        profileFields: ['id', 'displayName', 'photos', 'emails'] //custmize what to retrive from twitter

    },
    // twitter will send back the token and profile
    function(token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'twitter.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    newUser.type = "twitter";
                    // set all of the facebook information in our user model
                    newUser.twitter.id = profile.id; // set the users facebook id
                    //newUser.twitter.token = token; // we will save the token that facebook provides to the user
                    newUser.twitter.name = profile.username; // look at the passport user profile to see how names are returned
                    newUser.twitter.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    newUser.twitter.avatar = profile.photos[0].value;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // Google ================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true
    },
    // google will send back the token and profile
    function(request, accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'google.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    newUser.type = "google";
                    // set all of the facebook information in our user model
                    newUser.google.id = profile.id; // set the users google id
                    newUser.google.displayName = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.google.familyName = profile.name.familyName;
                    newUser.google.givenName = profile.name.givenName;
                    newUser.google.gender = profile.gender;
                    newUser.google.email = profile.email; // facebook can return multiple emails so we'll take the first
                    newUser.google.avatar = profile.photos[0].value;
                    newUser.google.language = profile.language;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // LinkedIn ================================================================
    // =========================================================================
    passport.use(new LinkedInStrategy({
        clientID: configAuth.linkedinAuth.clientID,
        clientSecret: configAuth.linkedinAuth.clientSecret,
        callbackURL: configAuth.linkedinAuth.callbackURL,
        scope: [
            'r_emailaddress', 'r_basicprofile'
        ],
        state: true
    }, function(request, accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'linkedin.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    newUser.type = "linkedin";
                    // set all of the facebook information in our user model
                    newUser.linkedin.id = profile.id; // set the users facebook id
                    newUser.linkedin.displayName = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.linkedin.familyName = profile.name.familyName;
                    newUser.linkedin.givenName = profile.name.givenName;
                    newUser.linkedin.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    newUser.linkedin.avatar = profile.photos[0].value;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // Instagram ================================================================
    // =========================================================================
    passport.use(new InstagramStrategy({
        clientID: configAuth.instagramAuth.clientID,
        clientSecret: configAuth.instagramAuth.clientSecret,
        callbackURL: configAuth.instagramAuth.callbackURL
    }, function(accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'instagram.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.instagram.id = profile.id; // set the users facebook id
                    newUser.instagram.displayName = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.instagram.avatar = profile._json.data.profile_picture;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // Reddit ================================================================
    // =========================================================================
    passport.use(new RedditStrategy({
        clientID: configAuth.redditAuth.clientID,
        clientSecret: configAuth.redditAuth.clientSecret,
        callbackURL: configAuth.redditAuth.callbackURL
    }, function(accessToken, refreshToken, profile, done) {
        console.log(JSON.stringify(profile));
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'reddit.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.reddit.id = profile.id; // set the users facebook id
                    newUser.reddit.displayName = profile.name; // look at the passport user profile to see how names are returned
                    newUser.reddit.avatar = configAuth.redditAuth.avatar;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // Amazon ================================================================
    // =========================================================================
    passport.use(new AmazonStrategy({
        clientID: configAuth.amazonAuth.clientID,
        clientSecret: configAuth.amazonAuth.clientSecret,
        callbackURL: configAuth.amazonAuth.callbackURL
    }, function(accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'amazon.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.amazon.id = profile.id; // set the users facebook id
                    newUser.amazon.displayName = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.amazon.avatar = configAuth.amazonAuth.avatar;
                    newUser.amazon.email = profile.emails[0].value;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // Wechat ================================================================
    // =========================================================================
    passport.use(new WechatStrategy({
        appID: configAuth.wechatAuth.clientID,
        appSecret: configAuth.wechatAuth.clientSecret,
        callbackURL: configAuth.wechatAuth.callbackURL
    }, function(accessToken, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {
            // find the user in the database based on their twitter id
            User.findOne({
                'wechat.id': profile.id
            }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
                    // set all of the facebook information in our user model
                    newUser.wechat.id = profile.id; // set the users facebook id
                    newUser.wechat.displayName = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.wechat.avatar = configAuth.wechat.avatar;
                    newUser.wechat.email = profile.emails[0].value;
                    //save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));
};
