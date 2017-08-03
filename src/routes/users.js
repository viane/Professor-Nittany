const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const UDs = require('../models/major-list');
const Verify = require('../system/utility/verify');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const crypto = require('crypto');
const async = require('async');
/* GET users listing. */
router.route('/').get(function(req, res, next) {
  User.find({}).populate('major').populate('question_history').populate('interest').populate('interest_manual').populate('inbox').populate('personality_evaluation').populate('assessement'). //Schema hasn't been registered for model {Assessement}
  exec(function(err, user) {
    if (err)
      return next(err);
    res.json(user);
  });
});

//get User information
router.route('/get-user').get(Verify.verifyOrdinaryUser,function(req, res, next) {
  User.findById(req.decoded._id).populate('major').populate('interest').populate('interest_manual').populate('inbox').populate('personality_evaluation').populate('assessement') //Schema hasn't been registered for model {Assessement}
  .exec(function(err, user) {
    if (err)
      return next(err);
    res.json(user);
  });
}).delete(function(req, res, next) {
  User.remove({
    'email': req.body.email
  }, function(err, resp) {
    if (err)
      return next(err);
    res.json(resp);
  });
});

//API user local signup : post /users/signup
router.post('/signup', function(req, res) {
  if (!Verify.verifyPasswordFormat(req.body.password)) {
    return res.status(200).json({
      err: {
        name: "InvalidPasswordFormat",
        message: "Invalid password format, check the rule of making password."
      }
    });
  }
  if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.account_role) {
    return res.status(200).json({
      err: {
        name: "MissRequiredInformation",
        message: "Miss requireed signup infomation."
      }
    });
  }
  User.register(new User({first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email}), req.body.password, function(err, user) {
    if (err) {
      return res.status(200).json({err: err});
    }
    if (req.body.account_role.toLowerCase() === "student") {
      user.account_role = "student";
    }

    if (req.body.account_role.toLowerCase() === "adviser") {
      user.account_role = "adviser";
    }

    user.status = "inactive";

    crypto.randomBytes(20, (err, buf) => {
      const token = buf.toString('hex');
      user.activation_code = token;
      //process major

      user.save(function(err, user) {
        if (err) {
          console.error(err);
          res.status(200).json({status: err});
        }

        // email the actvition code
        const mailer = nodemailer.createTransport({
          host: "smtp-mail.outlook.com", // hostname
          secureConnection: false, // TLS requires secureConnection to be false
          port: 587, // port for secure SMTP
          tls: {
            ciphers: 'SSLv3'
          },
          auth: {
            user: 'IntelligentAcademicAdvisor@outlook.com',
            pass: 'PSUIAA2017'
          }
        });
        const mailOptions = {
          to: user.email,
          from: 'Intelligent Academic Advisor <IntelligentAcademicAdvisor@outlook.com>',
          subject: 'Intelligent Academic Advisor Account Activation',
          html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Advisor Account Activation</h1><p>You are receiving this because you (or someone else) have requested the activation of your account.</p><p>Please click on the following link to complete the process.</p><a href="http://' + req.headers.host + '/users/active-account/' + token + '"  style="display: block;width:200px;padding: 10px;line-height: 1.4;background-color: #94B8E9; color: #fff;text-decoration: none; text-align: center; margin: 0 auto;border-radius:4px;">Activate Account</a><p>Or manually paste the following link to your broswer: http://' + req.headers.host + '/users/active-account/' + token + '</p><p>If you did not request this, please ignore this email and your account will remain inactive.</p></body></html>'
        };
        mailer.sendMail(mailOptions, (err) => {
          if (err) {
            console.error(err);
            return res.status(200).json({status: 'Successfully registered, but failed to send you the activation link,please try reset password or contact us.'});
          }
          return res.status(200).json({status: 'Successfully registered, an activation link has been sent to your email.'});
        });
      });
    });
  });
});

// API for active user account get /users/active-account/:token

router.get('/active-account/:token', (req, res) => {
  User.findOne({
    "activation_code": req.params.token
  }, (err, user) => {
    if (!user) {
      return res.status(200).json({status: 'Account activation token is invalid or account is already activated.'});
    }
    if (user.activation_code === req.params.token) {
      user.activation_code = null;
      user.status = "active";
      user.save((err, activeUser) => {
        if (err) {
          console.error(err);
          return res.status(200).json({status: 'There is an issue with the system, please try again or contact us.'});
        }
        req.logIn(activeUser, function(err) {
          if (err) {
            console.error(err);
            return res.status(200).json({status: 'There is an issue with the account, please try again or contact us.'});
          }
        });
        // email notice account is activated
        const mailer = nodemailer.createTransport({
          host: "smtp-mail.outlook.com", // hostname
          secureConnection: false, // TLS requires secureConnection to be false
          port: 587, // port for secure SMTP
          tls: {
            ciphers: 'SSLv3'
          },
          auth: {
            user: 'IntelligentAcademicAdvisor@outlook.com',
            pass: 'PSUIAA2017'
          }
        });
        const mailOptions = {
          to: activeUser.email,
          from: 'Intelligent Academic Advisor <IntelligentAcademicAdvisor@outlook.com>',
          subject: 'Intelligent Academic Advisor Account Activation',
          html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Advisor Account Activation</h1><p>This is a confirmation that your account ' + activeUser.email + ' has just been activated.</p></body></html>'
        };
        mailer.sendMail(mailOptions, (err) => {
          if (err) {
            console.error(err);
          }
        });
        return res.status(200).json({status: 'Your account is successfully activated now. You can go to your <a href=\'users/profile\'>Profile Page</a> now'});
      })
    }
  });
})

///////////////////////////////////////////////////////////////
// post request for requesting change password to a email
///////////////////////////////////////////////////////////////
router.post('/request-reset-password', (req, res, next) => {
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({
        "email": req.body.email
      }, (err, user) => {
        if (err) {
          console.error(err);
          return res.status(200).json(err : {
            name: "SystemError",
            message: "An error has occured, please try again later or contact us."
          });
        }

        if (!user) {
          return res.status(200).json(err : {
            name: "InvalidEmail",
            message: "No account with this email address exists."
          });
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save((err) => {
          if (err) {
            console.error(err);
            return res.status(200).json(err : {
              name: "SystemError",
              message: "An error has occured, please try again later or contact us."
            });
          }
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      const mailer = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
          ciphers: 'SSLv3'
        },
        auth: {
          user: 'IntelligentAcademicAdvisor@outlook.com',
          pass: 'PSUIAA2017'
        }
      });

      const mailOptions = {
        to: user.email,
        from: 'Intelligent Academic Advisor <IntelligentAcademicAdvisor@outlook.com>',
        subject: 'Intelligent Academic Advisor Password Reset',

        html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Advisor Reset Password</h1><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link to complete the process.</p><a href="http://' + req.headers.host + '/users/update-password/' + token + '"  style="display: block;width:200px;padding: 10px;line-height: 1.4;background-color: #94B8E9; color: #fff;text-decoration: none; text-align: center; margin: 0 auto;border-radius:4px;">Reset My Passowrd</a><p>Or manually paste the following link to your broswer: http://' + req.headers.host + '/users/update-password/' + token + '</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p></body></html>'
      };
      mailer.sendMail(mailOptions, (err) => {
        if (err) {
          console.error(err);
          return res.status(200).json(err : {
            name: "SystemError",
            message: "An error has occured, please try again later or contact us."
          });
        }
        return res.status(200).json({status: 'success', message: "An e-mail has been sent to " + user.email + " with further instructions.", token: token});
      });
    }
  ]);
});

// =============================================================
// Get email that is requiring update password with token
// =============================================================
router.get('/update-password/:token', (req, res, next) => {
  User.findOne({
    "resetPasswordToken": req.params.token,
    "resetPasswordExpires": {
      $gt: Date.now()
    }
  }, (err, user) => {
    if (!user) {
      return res.status(200).json({status: 'Password reset token is invalid or has expired.'});
    }
    return res.status(200).json({email: user.email, token: req.params.token});
  });
});

// =============================================================
// Post update password
// =============================================================
router.post('/update-password', (req, res,next) => {
  if (!Verify.verifyPasswordFormat(req.body.password)) {
    return res.status(200).json({
      err: {
        name: "InvalidPasswordFormat",
        message: "Invalid password format, check the rule of making password."
      }
    });
  }
  if (!req.body.token || req.body.token === "") {
    return res.status(200).json({
      err: {
        name: "InvalidToken",
        message: "Empty token"
      }
    });
  }
  // update password
  async.waterfall([
    (done) => {
      User.findOne({
        'email': req.body.email.toLowerCase(),
        'resetPasswordToken': req.body.token,
        'resetPasswordExpires': {
          $gt: Date.now()
        }
      }, (err, user) => {
        if (!user) {
          return res.status(200).json(err : {
            name: "InvalidToken",
            message: "Password reset token is invalid or has expired."
          });
        }
        user.setPassword(req.body.password, function(err,resp){
          if(err) return next(err);
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          user.save((err, user) => {
            if (err) {
              console.error(err);
              return res.status(200).json(err : {
                name: "SystemError",
                message: "An error has occured, please try again later or contact us."
              });
            }
            req.logIn(user, (err) => {
              if (err) {
                console.error(err);
                return res.status(200).json(err : {
                  name: "SystemError",
                  message: "An error has occured, please try again later or contact us."
                });
              }
              var token = Verify.getToken({"username": user.username, "_id": user._id, "status": user.status, "account_role": user.account_role});
              res.status(200).json({status: 'Password reset successful', success: true, token: token});
              done(err, user);
            });
          });
        })

        // user.hashPassword(req.body['password-primary'])  <------------ fix this, assign user new hashed password

      });
    },
    (user, done) => {
      const mailer = nodemailer.createTransport({
        host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        tls: {
          ciphers: 'SSLv3'
        },
        auth: {
          user: 'IntelligentAcademicAdvisor@outlook.com',
          pass: 'PSUIAA2017'
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'Intelligent Academic Advisor <IntelligentAcademicAdvisor@outlook.com>',
        subject: 'Intelligent Academic Advisor: Successfully Reset Password',
        html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Advisor Reset Password</h1><p>This is a confirmation that the password for your account ' + user.email + ' has just been changed.</p></body></html>'
      };
      mailer.sendMail(mailOptions, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  ]);
})

//API user local signin: post /users/signin
router.post('/signin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({err: info});
    }
    if (user.status === "inactive" || user.activation_code != null) {
      return res.status(200).json({err: 'Your account is inactive.'});
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(200).json({err: 'Could not log in user'});
      }

      var token = Verify.getToken({"username": user.username, "_id": user._id, "status": user.status, "account_role": user.account_role});
      res.status(200).json({status: 'Login successful!', success: true, token: token});
    });
  })(req, res, next);
});

//user faceback login api : get /users/signup-facebook
router.get('/signup-facebook', passport.authenticate('facebook', {scope: 'email'}), function(req, res) {});

//usesr facebook callback api: get /facebook/callback
router.get('/facebook/callback', function(req, res, next) {

  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({err: info});
    }

    req.logIn(user, function(err) {
      if (err) {
        return res.status(200).json({err: 'Could not log in user'});
      }
      var token = Verify.getToken({"username": user.username, "_id": user._id, "status": user.status, "account_role": user.account_role});
      res.status(200).redirect("/users/signin/callback?token=" + token + "&status=Login%20successful!" + "&success=true");
    });
  })(req, res, next);
});

//API user linkedin login: get /users/signup-linkedin
router.get('/signup-linkedin', passport.authenticate('linkedin'), function(req, res) {});

//API usesr linkedin callback: get /users/linkedin/callback
router.get('/linkedin/callback', function(req, res, next) {
  passport.authenticate('linkedin', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({err: info});
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(200).json({err: 'Could not log in user'});
      }
      var token = Verify.getToken({"username": user.username, "_id": user._id, "status": user.status, "account_role": user.account_role});
      res.status(200).redirect("/users/signin/callback?token=" + token + "&status=Login%20successful!" + "&success=true");
    });
  })(req, res, next);
});

// //API user twitter login: get /users/twitter
// router.get('/signup-twitter', passport.authenticate('twitter'));
//
// //API usesr twitter callback: get /users/twitter/callback
// router.get('/twitter/callback', function(req,res,next){
//   passport.authenticate('twitter', function(err, user, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(401).json({
//         err: info
//       });
//     }
//     req.logIn(user, function(err) {
//       if (err) {
//         return res.status(200).json({
//           err: 'Could not log in user'
//         });
//       }
//       var token = Verify.getToken({"username":user.username, "_id":user._id, "status":user.status, "account_role":user.account_role});
//       res.status(200).redirect("/users/signin/callback?token="+token+"&status=Login%20successful!"+"&success=true");
//     });
//   })(req,res,next);
// });

//API user google login: get /users/signup-google
router.get('/signup-google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
}, function(req, res) {}));

//API usesr google callback: get /users/google/callback
router.get('/google/callback', function(req, res, next) {
  passport.authenticate('google', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({err: info});
    }
    req.logIn(user, function(err) {
      if (err) {
        console.log(err);
        return res.status(200).json({err: 'Could not log in user'});
      }
      var token = Verify.getToken({"username": user.username, "_id": user._id, "status": user.status, "account_role": user.account_role});
      res.status(200).redirect("/users/signin/callback?token=" + token + "&status=Login%20successful!" + "&success=true");
    });
  })(req, res, next);
});

router.get("/signin/callback", function(req, res, next) {
  res.json(req.query);
});

module.exports = router;
