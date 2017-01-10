// app/routes.js
var crypto = require('crypto');

// load up the question answer model
var questionAnswer = require('../app/models/QA');

var vcapServices = require('vcap_services'),
    extend       = require('util')._extend,
    watson       = require('watson-developer-cloud');

var config = extend({
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: '110115fe-46e5-42cd-a5c3-41a09be09375',
  password: 'UA8PfTGKRr60'
}, vcapServices.getCredentials('speech_to_text'));

var authService = watson.authorization(config);


module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs', {user: req.user}); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup',
    //email and password not empty, start local authentication
    passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // TWITTER ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // GOOGLE ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/plus.me', 'profile']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // LINKEDIN ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/linkedin', passport.authenticate('linkedin', {
        scope: ['r_basicprofile', 'r_emailaddress']
    }));

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // INSTAGRAM ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/instagram', passport.authenticate('instagram'));

    app.get('/auth/instagram/callback', passport.authenticate('instagram', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // REDDIT ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/reddit', function(req, res, next) {
        req.session.state = crypto.randomBytes(32).toString('hex');
        passport.authenticate('reddit', {
            state: req.session.state,
            duration: 'permanent'
        })(req, res, next);
    });

    app.get('/auth/reddit/callback', function(req, res, next) {
        // Check for origin via state token
        if (req.query.state == req.session.state) {
            passport.authenticate('reddit', {
                successRedirect: '/profile',
                failureRedirect: '/'
            })(req, res, next);
        } else {
            next(new Error(403));
        }
    });

    // =====================================
    // AMAZON ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/amazon', passport.authenticate('amazon', {
        scope: ['profile', 'postal_code']
    }));

    app.get('/auth/amazon/callback', passport.authenticate('amazon', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // WECHAT ROUTES =====================
    // =====================================
    // route for wechat authentication and login
    app.get('/auth/wechat', passport.authenticate('wechat', {scope: ['profile']}));

    app.get('/auth/wechat/callback', passport.authenticate('wechat', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // Admin console
    // =====================================
    app.get('/admin', isLoggedIn, function(req, res) {
        res.render('admin.ejs', {
            message: req.flash('Message'),
            user: req.user
        }); // load the index.ejs file
    });

    // =================================================
    // Routes for developer manage question and answer
    // =================================================

    app.get('/QuestionAnswerManagement', isLoggedIn, function(req, res) {
        res.render('QuestionAnswerManagement.ejs', {
            message: req.flash('Message'),
            user: req.user
        }); // load the index.ejs file
    });

    app.post('/postQuestionAnswer', function(req, res) {
        //input check
        var questionContext = req.body.question;
        var answerContext = req.body.answer;
        var tagContext = req.body.tag;
        console.log(questionContext + questionContext.length);
        if (questionContext.length == 0) {
            res.send({user: req.user, status: "0", message: "Question can not be empty"})
        } else {
            //create DB object
            var QA_pair = new questionAnswer();

            //assign values
            QA_pair.record.question = questionContext;
            QA_pair.record.answer = answerContext;
            QA_pair.record.tag = tagContext;

            //Save to DB
            QA_pair.save(function(err) {
                if (err) {
                    res.send({
                        user: req.user,
                        status: "-1",
                        message: err + "</br>Save data to other place."
                    })
                    throw err;
                }
                // if successful, return the new user
                res.send({user: req.user, status: "1", message: "Successfully added entry"})
            });
        }
    });

    app.get('/viewQuestionAnswer', function(req, res) {
        //input parameter

        //create DB connection

        //find entry

        //send to client

    });

    app.get('/css/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    app.get('/fonts/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    app.get('/js/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                console.log(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    app.get('/img/*', function(req, res) {
        res.sendfile(req.path, {
            'root': root
        }, function(err) {
            if (err) {
                pmt(err);
                res.status(err.status).end();
            } else {
                console.log('Sent:', req.path);
            }
        });
    });

    //stt
    app.get('/dev/voice', function(req, res) {
        res.render('dev/voice.ejs', { ct: req._csrfToken });
    });

    // Get token using your credentials
    app.post('/api/token', function(req, res, next) {
      authService.getToken({url: config.url}, function(err, token) {
        if (err)
          next(err);
        else
          res.send(token);
      });
    });

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
