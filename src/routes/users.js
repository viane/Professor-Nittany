var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var UDs = require('../models/major-list');
var Verify    = require('./verify');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
/* GET users listing. */
router.route('/')
.get(function(req, res, next) {
  User.find({})
    .populate('major')
    .exec(function (err,user){
    if (err) return next(err);
    res.json(user);
  });
})
.delete(function(req,res,next){
  User.remove({}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

//API user local signup : post /user/signup
router.post('/signup', function(req, res) {
    if (!Verify.verifyPasswordFormat(req.body.password)) {
            return done("Invalid password format, check the rule of making password.", false, req.flash('signupMessage', 'Invalid password format')); // req.flash is the way to set flashdata using connect-flash
    }

    User.register(new User({ username : req.body.email, 
                             first_name:req.body.first_name, 
                             last_name:req.body.last_name,
                             email: req.body.email}),
      req.body.password, function(err, user) {
        console.log(req.body);
        if (err) {
            return res.status(500).json({err: err});
        }
        user.last_name = req.body.last_name;
        if (req.body.account_role === "Student") {
            user.account_role = "student";
        }

        if (req.body.account_role === "Advisor") {
            user.account_role = "advisor";
        }

        if(req.body.major.length){
            for(let i=0; i<req.body.major.length; i++){
              //console.log(UDs.find({_id: req.body.major[i]}, {_id: 1}).limit(1));
              if(UDs.find({_id: req.body.major[i]}, {_id: 1}).limit(1)=="None"){
                  return done("Invalid Major Entered", false, req.flash('signupMessage', 'Invalid Major Entered'));
              }
              user.major.push(req.body.major[i]);
          }                            
        }
        console.log(user);
        user.save(function(err,user) {
            passport.authenticate('local')(req, res, function () {            
              console.log("authenticate");
                // const mailer = nodemailer.createTransport({
                //     host: "smtp-mail.outlook.com", // hostname
                //     secureConnection: false, // TLS requires secureConnection to be false
                //     port: 587, // port for secure SMTP
                //     tls: {
                //         ciphers: 'SSLv3'
                //     },
                //     auth: {
                //         user: 'IntelligentAcademicPlanner@outlook.com',
                //         pass: 'IAPGraduation2017'
                //     }
                // });
                // const mailOptions = {
                //     to: req.body.email,
                //     from: 'Intelligent Academic Advisor <IntelligentAcademicPlanner@outlook.com>',
                //     subject: 'Intelligent Academic Advisor Account Activation',
                //     html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Planner Account Activation</h1><p>You are receiving this because you (or someone else) have requested the activation of your account.</p><p>Please click on the following link to complete the process.</p><a href="http://' + req.headers.host + '/active-account/' + token + '"  style="display: block;width:200px;padding: 10px;line-height: 1.4;background-color: #94B8E9; color: #fff;text-decoration: none; text-align: center; margin: 0 auto;border-radius:4px;">Activate Account</a><p>Or manually paste the following link to your broswer: http://' + req.headers.host + '/active-account/' + token + '</p><p>If you did not request this, please ignore this email and your account will remain inactive.</p></body></html>'
                // };
                // mailer.sendMail(mailOptions, (err) => {
                //     if (err) {
                //         console.error(err);
                //         return done("An error has occurred, please try reset password or contact us.", null, req.flash('signupMessage', "An error has occured, please try reset password or contact us."));
                //     }
                //     
                // });
                return res.status(200).json({status: 'Registration Letter in Your E-mail!'});
            });
        });
    });
});

//user local signin api : post /user/signin
router.post('/signin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        
      var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

//user local logout api : post /user/logout
router.get('/logout', function(req, res) {
    req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

//user faceback login api : get /user/facebook
router.get('/facebook', passport.authenticate('facebook'),
  function(req, res){});

//usesr facebook callback api: get /facebook/callback
router.get('/facebook/callback', function(req,res,next){
  passport.authenticate('facebook', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken(user);
      res.status(200).json({
        status: 'Login successful!',
        success: true,
        token: token
      });
    });
  })(req,res,next);
});

module.exports = router;