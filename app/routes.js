// app/routes.js

'use strict'

var crypto = require('crypto');

// load up the question answer model
const question = require('../app/models/question');
const appRoot = require('app-root-path');
const frontEndRoot = appRoot + '/views/FrontEnd/';
const watsonToken = require('./watson-token');
const accountManage = require(appRoot + '/app/api/account');
const uploadQuestionByTextFile = require('./file-to-questionDB');
const User = require(appRoot + "/app/models/user");
const testingAPIModule = require(appRoot + '/app/testing/testAPI');
const profileAPI = require(appRoot + '/app/profile');
const validator = require("email-validator");
const serverStatusAPI = require(appRoot + '/app/api/server-status');
const system = require(appRoot + '/app/api/system');
const loginChecking = require(appRoot + '/app/utility-function/login-checking');
const phoneQA = require(appRoot + '/app/api/phone-question-answer');
const smsQA = require(appRoot + '/app/api/sms-question-answer');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

module.exports = function(app, passport) {
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render(frontEndRoot + 'index.ejs', {user: req.user}); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        } else {
            // render the page and pass in any flash data if it exists
            res.render(frontEndRoot + 'login.ejs', {message: req.flash('loginMessage')});
        }
    });

    // process the login form
    app.post('/login', (req, res, next) => {
        // precondition checking
        // callback with email and password
        if (!req.body.email || req.body.email.length == 0) {
            res.send({status: 302, type: 'error', information: 'Email can\'t be empty'});
            return;
        }
        if (!req.body.password || req.body.password.length == 0) {
            res.send({status: 302, type: 'error', information: 'Password can\'t be empty'});
            return;
        }
        if (!validator.validate(req.body.email)) {
            res.send({status: 302, type: 'error', information: 'Invalid email'});
            return;
        }
        passport.authenticate('local-login', (err, user, info) => {
            if (err) {
                return res.send({status: 302, type: 'error', information: err});
            } else {
                // req / res held in closure
                req.logIn(user, function(err) {
                    if (err) {
                        return res.send({status: 302, type: 'error', information: err});
                    }
                    req.session.userid = user;
                    return res.send({status: 200, type: 'success', information: "Login success"});
                });
            }
        })(req, res, next);
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render(frontEndRoot + 'signup.ejs', {message: req.flash('signupMessage')});
    });

    // process the signup form
    app.post('/signup', (req, res, next) => {
        // precondition checking
        if (checkSignUpParameter(req, res)) {
            //email and password not empty, start local authentication
            passport.authenticate('local-signup', (err, user, info) => {
                if (err) {
                    return res.send({status: 302, type: 'error', information: err});
                } else {
                    return res.send({status: 200, type: 'success', information: "Successfully registered, an activation link has been sent to your email."});
                }
            })(req, res, next)
        }
    });

    // =====================================
    // Active Account with token
    // =====================================
    app.get('/active-account/:token', (req, res) => {
        User.findOne({
            "local.account_activation_code": req.params.token
        }, (err, user) => {
            if (!user) {
                return res.render(frontEndRoot + 'active-account.ejs', {token_error: 'Account activation token is invalid or account is already activated.'});
            }
            if (user.local.account_activation_code === req.params.token) {
                user.local.account_activation_code = null;
                user.local.account_status = "active";
                user.save((err, newUser) => {
                    if (err) {
                        console.error(err);
                        return res.render(frontEndRoot + 'active-account.ejs', {system_error: 'There is an issue with the system, please contact us.'});
                    }
                    req.logIn(newUser, function(err) {
                        if (err) {
                            console.error(err);
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
                            user: 'IntelligentAcademicPlanner@outlook.com',
                            pass: 'IAPGraduation2017'
                        }
                    });
                    const mailOptions = {
                        to: newUser.local.email,
                        from: 'Intelligent Academic Advisor <IntelligentAcademicPlanner@outlook.com>',
                        subject: 'Intelligent Academic Advisor Account Activation',
                        html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Planner Account Activation</h1><p>This is a confirmation that your account ' + newUser.local.email + ' has just been activated.</p></body></html>'
                    };
                    mailer.sendMail(mailOptions, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                    return res.render(frontEndRoot + 'active-account.ejs', {
                        success: 'Your account is successfully activated now. You can go to your <a href=\'/profile\'>Profile Page</a> now',
                        activation_email: newUser.local.email
                    });
                })
            }

        });
    });

    // =====================================
    // Reset Password
    // =====================================
    app.get('/reset-password', function(req, res) {
        if (req.user) {
            res.redirect('/profile')
        } else {
            res.render(frontEndRoot + 'reset-password.ejs');
        }
    });

    // =====================================
    // Update Password with token
    // =====================================
    app.get('/update-password/:token', (req, res) => {
        User.findOne({
            "local.resetPasswordToken": req.params.token,
            "local.resetPasswordExpires": {
                $gt: Date.now()
            }
        }, (err, user) => {
            if (!user) {
                return res.render(frontEndRoot + 'reset-password.ejs', {token_error: 'Password reset token is invalid or has expired.'});
            }
            res.render(frontEndRoot + 'update-password.ejs', {
                reset_email: user.local.email,
                reset_token: req.params.token
            });
        });
    });

    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the loginChecking.isLoggedInRedirect function)
    app.get('/profile', loginChecking.isLoggedInRedirect, function(req, res) {
        User.findById(req.user._id, function(err, foundUser) {
            res.render(frontEndRoot + 'profile.ejs', {
                user: req.user, // get the user out of session and pass to template
                introduction: foundUser.personality_assessement.description_content,
                ask_history: foundUser.ask_history,
                personality_assessement: foundUser.personality_assessement.evaluation,
                privacy: foundUser.privacy
            });
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
        failureRedirect: '/login'
    }));

    // =====================================
    // TWITTER ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/twitter', passport.authenticate('twitter', {scope: 'email'}));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/login'
    }));

    // =====================================
    // GOOGLE ROUTES =====================
    // =====================================
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/plus.me', 'profile']
    }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/login'
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
        failureRedirect: '/login'
    }));

    // =====================================
    // INSTAGRAM ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // app.get('/auth/instagram', passport.authenticate('instagram'));
    //
    // app.get('/auth/instagram/callback', passport.authenticate('instagram', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/'
    // }));

    // =====================================
    // REDDIT ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // app.get('/auth/reddit', function(req, res, next) {
    //     req.session.state = crypto.randomBytes(32).toString('hex');
    //     passport.authenticate('reddit', {
    //         state: req.session.state,
    //         duration: 'permanent'
    //     })(req, res, next);
    // });
    //
    // app.get('/auth/reddit/callback', function(req, res, next) {
    //     // Check for origin via state token
    //     if (req.query.state == req.session.state) {
    //         passport.authenticate('reddit', {
    //             successRedirect: '/profile',
    //             failureRedirect: '/'
    //         })(req, res, next);
    //     } else {
    //         next(new Error(403));
    //     }
    // });

    // =====================================
    // AMAZON ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    // app.get('/auth/amazon', passport.authenticate('amazon', {
    //     scope: ['profile', 'postal_code']
    // }));
    //
    // app.get('/auth/amazon/callback', passport.authenticate('amazon', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/'
    // }));

    // =====================================
    // WECHAT ROUTES =====================
    // =====================================
    // route for wechat authentication and login
    // app.get('/auth/wechat', passport.authenticate('wechat', {scope: ['profile']}));
    //
    // app.get('/auth/wechat/callback', passport.authenticate('wechat', {
    //     successRedirect: '/profile',
    //     failureRedirect: '/'
    // }));

    ////////////////////////////////////////////////
    // Inbox main
    ///////////////////////////////////////////////////

    app.get('/inbox', loginChecking.isLoggedInRedirect, function(req, res) {
        console.log(req.user);
        res.render(frontEndRoot + '/inbox.ejs', {user: req.user});
    });

    // =====================================
    // Advisor page
    // =====================================
    app.get('/advising', loginChecking.isAdvisorRedirect, function(req, res) {
        User.findById(req.user._id, function(err, foundUser) {
            res.render(frontEndRoot + 'advising.ejs', {
                user: req.user,
                privacy: foundUser.privacy
            });
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // Server status
    // =====================================
    app.get('/status', function(req, res) {
        res.render(frontEndRoot + 'status.ejs', {});
    });

    // =====================================
    // Admin console
    // =====================================
    app.get('/admin', loginChecking.isAdminRedirect, function(req, res) {
        res.render(frontEndRoot + 'admin.ejs', {
            message: req.flash('Message'),
            user: req.user
        }); // load the index.ejs file
    });

    // =================================================
    // Routes for developer manage question and answer
    // =================================================

    app.get('/QuestionAnswerManagement', loginChecking.isAdminRedirect, function(req, res) {
        res.render(frontEndRoot + 'question-Answer-Management.ejs', {
            message: req.flash('Message'),
            user: req.user
        }); // load the index.ejs file
    });

    app.post('/postQuestionAnswer', loginChecking.isAdminRedirect, function(req, res) {
        //input check
        var questionContext = req.body.question;
        var answerContext = req.body.answer;
        var tagContext = req.body.tag;
        console.log(req.user._id);
        if (questionContext.length == 0) {
            res.send({user: req.user, status: "302", type: 'warning', message: "Question can not be empty"})
        } else {
            //create DB object
            var QA_pair = new question();

            //assign values
            QA_pair.question_body = questionContext;
            QA_pair.question_answer = answerContext;
            QA_pair.question_tag = tagContext;
            QA_pair.question_submitter = req.user._id;
            QA_pair.question_upload_mothod = "mannual";

            //Save to DB
            QA_pair.save(function(err) {
                if (err) {
                    res.send({
                        user: req.user,
                        status: "302",
                        type: 'error',
                        message: err + "</br>Save data to other place."
                    })
                    throw err;
                }
                // if successful, return the new user
                res.send({user: req.user, status: "200", type: 'success', message: "Successfully added entry"})
            });
        }
    });

    app.get('/viewQuestionAnswer', loginChecking.isAdminRedirect, function(req, res) {
        //input parameter

        //create DB connection

        //find entry

        //send to client

    });

    // =================================================
    // Routes for developer manage system
    // =================================================

    app.get('/SystemManagement', loginChecking.isAdminRedirect, function(req, res) {
        res.render(frontEndRoot + 'system-management.ejs', {user: req.user});
    });

    ////////////////////////////////////////////////
    // Front end files routes
    ///////////////////////////////////////////////////
    app.get('/css/*', function(req, res) {
        var options = {
            root: appRoot + '/views/FrontEnd',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(req.path, options, function(err) {
            if (err) {
                console.error(err);
            }
        });
    });

    app.get('/fonts/*', function(req, res) {
        var options = {
            root: appRoot + '/views/FrontEnd',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(req.path, options, function(err) {
            if (err) {
                console.error(err);
            }
        });
    });

    app.get('/js/*', function(req, res) {
        var options = {
            root: appRoot + '/views/FrontEnd',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(req.path, options, function(err) {
            if (err) {
                console.error(err);
            }
        });
    });

    app.get('/avatar/*', function(req, res) {
        var options = {
            root: appRoot + '/views/FrontEnd',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile(req.path, options, function(err) {
            if (err) {
                console.error(err);
            }
        });
    });

    // router for user ask questionn not on index page
    app.get('/external-ask', (req, res) => {
        const question = req.query.question;
        console.log(req.query.question);
        req.external_question = question;
        res.render(frontEndRoot + 'index.ejs', {
            external_question: req.external_question,
            user: req.user
        });
    })

    ///////////////////////////////////////////////////
    /// API
    ///////////////////////////////////////////////////

    // Get speech to text token route
    app.use('/api/speech-to-text', watsonToken);

    // local account API
    app.use('/api/account', accountManage);

    // admin upload questions from text file
    app.use('/api/admin/upload/', loginChecking.isLoggedInRedirect, uploadQuestionByTextFile);

    // General server functionality testing api
    app.use('/api/testing/', testingAPIModule);

    // Profile APIs
    app.use('/api/profile', loginChecking.isLoggedInRedirect, profileAPI);

    // Server status APIs
    app.use('/api/server-status', serverStatusAPI);

    // system AI APIs
    app.use('/api/system', loginChecking.isAdminRedirect, system);

    // phone system
    app.use('/api/phone-question-answer', phoneQA);

    // sms system
    app.use('/api/sms-question-answer', smsQA);
};

function checkSignUpParameter(req, res) {
    // callback with email and password from our form
    if (!req.body.first_name || req.body.first_name.length == 0 || !req.body.last_name || req.body.last_name.length == 0) {
        res.send({status: 302, type: 'error', information: 'Name can\'t be empty'});
        return false;
    }
    if (!req.body.email || req.body.email.length == 0) {
        res.send({status: 302, type: 'error', information: 'Email can\'t be empty'});
        return false;
    }
    if (!req.body.password || req.body.password.length == 0) {
        res.send({status: 302, type: 'error', information: 'Password can\'t be empty'});
        return false;
    }
    if (!req.body.account_role) {
        res.send({status: 302, type: 'error', information: 'Invalid account role'});
        return false;
    }

    if (req.body.account_role === "Admin" && (!req.body['admin-token'] || req.body['admin-token'] == 0)) {
        res.send({status: 302, type: 'error', information: 'Missing admin token for registering as admin'});
        return false;
    }

    if (req.body.account_role === "Advisor" && (!req.body['advisor-token'] || req.body['advisor-token'] == 0)) {
        res.send({status: 302, type: 'error', information: 'Missing advisor token for registering as advisor'});
        return false;
    }

    if (req.body.account_role === "Admin" && !validateAdminToken(req.body['admin-token'])) {
        res.send({status: 302, type: 'error', information: 'Invalid admin token'});
        return false;
    }

    if (req.body.account_role === "Advisor" && !validateAdvisorToken(req.body['advisor-token'])) {
        res.send({status: 302, type: 'error', information: 'Invalid advisor token'});
        return false;
    }
    return true;
}

const validateAdminToken = (token) => {
    const correctSecret = "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2";
    if (token === correctSecret) {
        return true;
    } else {
        return false;
    }
}

const validateAdvisorToken = (token) => {
    const correctSecret = "b2aP7l3PMqjnL1cZNDGIyWBoM5i2BW22oyUAFxEZo3Afv0vtGzRPt1mcrcNLPqoxxqDJunVWbie4CZ6hDXRwVMF1YMDGMHjXP5nCXb2UF1VY3K1cpefpKEoAzyeaKzTT";
    if (token === correctSecret) {
        return true;
    } else {
        return false;
    }
}
