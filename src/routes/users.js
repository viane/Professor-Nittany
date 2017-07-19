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
            return res.status(200).json({err:{name:"InvalidPasswordFormat", message: "Invalid password format, check the rule of making password."}});
    }
    if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.account_role) {
            return res.status(200).json({err:{name:"MissRequiredInformation", message: "Miss requireed signup infomation."}});
    }
    User.register(new User({ first_name:req.body.first_name,
                             last_name:req.body.last_name,
                             email: req.body.email}),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(200).json({err: err});
        }
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
              res.status(200).json({status: err});
            }
            return res.status(200).json({status: 'Successfully registered, check actvition email.'});
        });
    });
});

//API user local signin: post /users/signin
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
        return res.status(200).json({
          err: 'Could not log in user'
        });
      }

      var token = Verify.getToken({"username":user.username, "_id":user._id, "status":user.status, "account_role":user.account_role});
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
router.get('/facebook', passport.authenticate('facebook',{ scope: 'email'}),
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
        return res.status(200).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken({"username":user.username, "_id":user._id, "status":user.status, "account_role":user.account_role});
      res.status(200).redirect("/users/signin/callback?token="+token+"&status=Login%20successful!"+"&success=true");
    });
  })(req,res,next);
});

//API user linkedin login: get /linkedin
router.get('/linkedin', passport.authenticate('linkedin'),
  function(req, res){});

//API usesr linkedin callback: get /linkedin/callback
router.get('/linkedin/callback', function(req,res,next){
  passport.authenticate('linkedin', function(err, user, info) {
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
        return res.status(200).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken({"username":user.username, "_id":user._id, "status":user.status, "account_role":user.account_role});
      res.status(200).redirect("/users/signin/callback?token="+token+"&status=Login%20successful!"+"&success=true");
    });
  })(req,res,next);
});

//API user twitter login: get /twitter
router.get('/twitter', passport.authenticate('twitter'));

//API usesr twitter callback: get /twitter/callback
router.get('/twitter/callback', function(req,res,next){
  passport.authenticate('twitter', function(err, user, info) {
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
        return res.status(200).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken({"username":user.username, "_id":user._id, "status":user.status, "account_role":user.account_role});
      res.status(200).redirect("/users/signin/callback?token="+token+"&status=Login%20successful!"+"&success=true");
    });
  })(req,res,next);
});



//API user google login: get /google
router.get('/google', passport.authenticate('google',
  { scope:
    [ 'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read' ] },
  function(req, res){}));

//API usesr google callback: get /google/callback
router.get('/google/callback', function(req,res,next){
  passport.authenticate('google',function(err, user, info) {
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
        console.log(err);
        return res.status(200).json({
          err: 'Could not log in user'
        });
      }
      var token = Verify.getToken({"username":user.username, "_id":user._id, "status":user.status, "account_role":user.account_role});
      res.status(200).redirect("/users/signin/callback?token="+token+"&status=Login%20successful!"+"&success=true");
    });
  })(req,res,next);
});

router.get("/signin/callback",function(req,res,next){
  res.json(req.query);
});

module.exports = router;
