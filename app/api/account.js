'use strict'
const appRoot = require('app-root-path');
const frontEndRoot = appRoot + '/views/FrontEnd/';
const express = require('express');
const router = express.Router();
const busboy = require('connect-busboy');
const path = require('path');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const bcrypt = require('bcrypt-nodejs');
const async = require('async');
const crypto = require('crypto');
const loginChecking = require(appRoot + '/app/utility-function/login-checking');
const accountUtility = require(appRoot + '/app/utility-function/account');
let User = require(appRoot + '/app/models/user');

router.post('/apply-admin', loginChecking.isLoggedInRedirect, (req, res) => {
    const id = req.user._id;
    const activationCode = req.body.code;
    if (validateActivationCode(activationCode)) {
        User.update({
            _id: id
        }, {
            $set: {
                "local.role": "admin"
            }
        }).exec().then(function(updatedUser) {
            res.send({type: 'success', information: 'Successfully applied.', newUser: updatedUser});
        }).catch(function(err) {
            throw err
            res.send({type: 'error', information: err});
        })
    } else {
        res.send({type: 'error', information: 'Wrong invitation code.'}); // req.flash is the way to set flashdata using connect-flash
    }
});

// post request for requesting change password to a email
router.post('/reset-password', (req, res) => {
    if (req.user) {
        return res.redirect('/profile');
    }
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => {
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({
                "local.email": req.body.email
            }, (err, user) => {
                if (err) {
                    console.error(err);
                    return res.send({type: "error", information: "There is an issue with system, please try again later or contact us."});
                }

                if (!user) {
                    return res.send({type: "error", information: "No account with this email address exists."});
                }

                user.local.resetPasswordToken = token;
                user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        (token, user, done) => {
            const mailer = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'xiaoyuz2011@gmail.com',
                    pass: 'Zsbqwacc1'
                }
            }));
            const mailOptions = {
                to: user.local.email,
                from: 'Intelligent Academic Advisor <xpz5043@psu.edu>',
                subject: 'Intelligent Academic Advisor Password Reset',
                html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Planner Reset Password</h1><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link to complete the process.</p><a href="http://' + req.headers.host + '/update-password/' + token + '"  style="display: block;width:200px;padding: 10px;line-height: 1.4;background-color: #94B8E9; color: #fff;text-decoration: none; text-align: center; margin: 0 auto;border-radius:4px;">Reset My Passowrd</a><p>Or mannually paste the following link to your broswer: http://' + req.headers.host + '/update-password/' + token + '</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p></body></html>'
            };
            mailer.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error(err);
                    return res.send({type: 'error', information: 'An error has occured, please try again later or contact us.'});
                }
                res.send({
                    type: 'success',
                    information: 'An e-mail has been sent to ' + user.local.email + ' with further instructions.',
                    token: token
                });
            });
        }
    ]);
});

router.post('/update-password', (req, res) => {
    if (req.user) {
        return res.redirect('/profile');
    }
    // password check valid password format
    if (!accountUtility.validPasswordFormat(req.body['password-primary'])) {
      return res.send({type: 'error', information: 'Invalid password format, check the rule of making password.'});
    }
    const password1 = req.body['password-primary'];
    const password2 = req.body['password-secondary'];
    if (password1 !== password2 || req.body.token === "" || !req.body.token) {
        return res.send({type: 'error', information: 'There is an issue with your request, please try again.'});
    }
    // update password
    async.waterfall([
        (done) => {
            User.findOne({
                'local.email': req.body.email.toLowerCase(),
                'local.resetPasswordToken': req.body.token,
                'local.resetPasswordExpires': {
                    $gt: Date.now()
                }
            }, (err, user) => {
                if (!user) {
                    return res.send({
                        type: "redirect",
                        url: req.headers.host + "/update-password/" + token
                    });
                }

                user.hashPassword(req.body['password-primary'])
                user.local.resetPasswordToken = undefined;
                user.local.resetPasswordExpires = undefined;
                user.save((err, user) => {
                    if (err) {
                        console.error(err);
                        return res.send({type: 'error', information: 'An error has occured, please try again later or contact us.'});
                    }
                    req.logIn(user, (err) => {
                        if (err) {
                            console.error(err);
                            return res.send({type: 'error', information: 'An error has occured, please try again later or contact us.'});
                        }
                        done(err, user);
                    });
                });
            });
        },
        (user, done) => {
            const mailer = nodemailer.createTransport(smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'xiaoyuz2011@gmail.com',
                    pass: 'Zsbqwacc1'
                }
            }));
            const mailOptions = {
                to: user.local.email,
                from: 'Intelligent Academic Advisor <xpz5043@psu.edu>',
                subject: 'Intelligent Academic Advisor: Successfully Reset Password',
                html: '<html><body style="background-color:white; border-radius:3px; padding: 30px;"><h1>Intelligent Academic Planner Reset Password</h1><p>This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.</p></body></html>'
            };
            mailer.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error(err);
                    return res.send({type: 'error', information: 'An error has occured, please try again later or contact us.'});
                }
                return res.send({type: 'success', information: 'Successfully update your new password.'});
            });
        }
    ]);
})

const validateActivationCode = function(code) {
    const correctSecret = "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2";
    if (code === correctSecret) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;
