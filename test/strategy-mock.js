"use strict";

var passport = require('passport')
var util = require('util');
var User = require('../app/models/user');

function StrategyMock(options, verify) {
	this.name = 'mock';
	this.passAuthentication = options.passAuthentication;
	this.email = options.email;
	this.password = options.password;
	this.verify = verify;
}

util.inherits(StrategyMock, passport.Strategy);

StrategyMock.prototype.authenticate = function authenticate(req) {
	if (this.passAuthentication) {
		var self = this;
		this.verify(req, this.email, this.password, function (err, resident) {
			if (err) {
				self.fail(err);
			} else {
				self.success(resident);
			}
		});
	} else {
		this.fail('Unauthorized');
	}
}

module.exports = StrategyMock;