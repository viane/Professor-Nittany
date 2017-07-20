'use strict';
var User = require('../../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../../config.js');
import util from 'util';

// login error class
function LoginError(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.redirect = "/signin"
  this.code = code;
};

util.inherits(LoginError, Error);

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new LoginError('You are not authenticated!',302);
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new LoginError('No token provided!',302);
        return next(err);
    }
};

exports.verifyAdminUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new LoginError('You are not authenticated!',302);
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                if(decoded.admin){
                    req.decoded = decoded;
                    next();
                }
                else{
                    var err = new LoginError('You are not authenticated to perform this operation!',401);
                    return next(err);
                }

            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new LoginError('No token provided!',302);
        return next(err);
    }
};

exports.verifyPasswordFormat = function(password){
  const passwordValidRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
  const spcialCharRegex = new RegExp("(?=.*[!@#\$%\^&\*])");
  if (!passwordValidRegex.test(password) || spcialCharRegex.test(password) || password.length == 0) {
    return false;
  }else {
    return true;
  }
};
