var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;
//var TwitterStrategy = require('passport-twitter').Strategy; //twitter signin disabled
var GoogleStrategy = require('passport-google-oauth2').Strategy;


var User = require('./models/user');
var config = require('./config');

exports.local = passport.use(new LocalStrategy({'usernameField':'email'},User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.facebook = passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret, 
  callbackURL: config.facebook.callbackURL,
  profileFields: ['id', 'displayName','name', 'photos', 'emails','gender']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({$or:[{facebook_OauthId: profile.id},{email: profile.emails[0].value}] }, function(err, user) {
      if(err) {
        console.log(err); // handle errors!
      }
      if (!err && user !== null) {
        if(!user.facebook_OauthId){
          user.facebook_OauthId = profile.id;
          user.save(function(err) {
            if(err) {
              console.log(err); // handle errors!
            }else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
        else{
          done(null, user);
        }     
      } else {

        user = new User({
          email: profile.emails[0].value,
          last_name: profile.name.familyName,
          first_name: profile.name.givenName
        });
        user.facebook_OauthId = profile.id;
        user.OauthToken = accessToken;
        user.status = "active";
        user.save(function(err) {
          if(err) {
            console.log(err); // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));


exports.linkedin = passport.use(new LinkedinStrategy({
    clientID: config.linkedin.clientID,
    clientSecret: config.linkedin.clientSecret,
    callbackURL: config.linkedin.callbackURL,
    scope:['r_emailaddress', 'r_basicprofile']
  },
  function(accessToken, tokenSecret, profile, done) {
    console.log(profile);
    User.findOne({$or:[{linkedin_OauthId: profile.id},{email: profile.emails[0].value}] }, function(err, user) {
      if(err) {
        console.log(err); // handle errors!
      }
      if (!err && user !== null) {
          if(!user.linkedin_OauthId){
          user.linkedin_OauthId = profile.id;
          user.save(function(err) {
            if(err) {
              console.log(err); // handle errors!
            }else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
        else{
          done(null, user);
        }  
      } else {

        user = new User({
          email: profile.emails[0].value,
          last_name: profile.name.familyName,
          first_name: profile.name.givenName
        });
        user.linkedin_OauthId = profile.id;
        user.OauthToken = accessToken;
        user.status = "active";
        user.save(function(err) {
          if(err) {
            console.log(err); // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));

//twitter signin disabled
// exports.twitter = passport.use(new TwitterStrategy({
//     consumerKey: config.twitter.consumerKey,
//     consumerSecret: config.twitter.consumerSecret,
//     callbackURL: config.twitter.callbackURL,
//     userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
//   }, function(accessToken, tokenSecret, profile, done) {
//     console.log(profile);
//   User.findOne({$or:[{twitter_OauthId: profile.id},{email: profile.emails[0].value}] }, function(err, user) {
//       if(err) {
//         console.log(err); // handle errors!
//       }
//       if (!err && user !== null) {
//           if(!user.twitter_OauthId){
//           user.twitter_OauthId = profile.id;
//           user.save(function(err) {
//             if(err) {
//               console.log(err); // handle errors!
//             }else {
//               console.log("saving user ...");
//               done(null, user);
//             }
//           });
//         }
//         else{
//           done(null, user);
//         }  
//       } else {
//         var fullname = profile._json.name.split(" ");
//         user = new User({
//           email: profile._json.email,
//           username: profile.screen_name,
//           last_name: profile.name.familyName,
//           first_name: profile.name.givenName
//         });
//         user.twitter_OauthId = profile.id;
//         user.OauthToken = accessToken;
//         user.status = "active";
//         user.save(function(err) {
//           if(err) {
//             console.log(err); // handle errors!
//           } else {
//             console.log("saving user ...");
//             done(null, user);
//           }
//         });
//       }
//     });
//   }
// ));

exports.google=passport.use(new GoogleStrategy({
    clientID:     config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOne({$or:[{google_OauthId: profile.id},{email: profile.emails[0].value}] }, function(err, user) {
      if(err) {
        console.log(err); // handle errors!
      }
      if (!err && user !== null) {
          if(!user.google_OauthId){
          user.google_OauthId = profile.id;
          user.save(function(err) {
            if(err) {
              console.log(err); // handle errors!
            }else {
              console.log("saving user ...");
              done(null, user);
            }
          });
        }
        else{
          done(null, user);
        }  
      } else {

        user = new User({
          email: profile.emails[0].value,
          last_name: profile.name.familyName,
          first_name: profile.name.givenName
        });
        user.google_OauthId = profile.id;
        user.OauthToken = accessToken;
        user.status = "active";
        user.save(function(err) {
          if(err) {
            console.log(err); // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
  }
));