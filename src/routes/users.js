var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var UDs = require('../models/major-list');
var Verify    = require('./verify');
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
  User.remove({"email":req.body.email}, function (err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

//API user local signup : post /user/signup
router.post('/signup', function(req, res) {
    if (!Verify.verifyPasswordFormat(req.body.password)) {
            return done("Invalid password format, check the rule of making password.", false, req.flash('signupMessage', 'Invalid password format')); // req.flash is the way to set flashdata using connect-flash
    }

    User.register(new User({
                             first_name:req.body.first_name,
                             last_name:req.body.last_name,
                             email: req.body.email}),
      req.body.password, function(err, user) {
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

        //process major

        user.save(function(err,user) {
            if (err) {
              console.error(err);
              res.status(302).json({status: err});
            }
            return res.status(200).json({status: 'Successfully registered, check actvition email.'});
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
