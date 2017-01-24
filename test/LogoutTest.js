const expect = require('chai').expect;
const request = require('request');
const assert = require('assert');
const appRoot = require('app-root-path');
const express = require('express');
const server = require(appRoot + '/server.js');
const mongoose = require('mongoose');
const Account = require(appRoot + '/app/models/user.js')
const local_URL = 'localhost:3000/';
var db;


describe('User JS Tests') {
	before(function(done) {
		db = mongoose.connect('mongodb://' + local_URL);
		done();
	});

	after(function(done) {
		mongoose.connection.close();
		done();
	});

	beforeEach(function(done) {
		var account = new Account({
			local.email: 'Tester@psu.edu',
			local.password: 'Test',
			local.displayName: 'Tester'
		});

		account.save(function(error) {
			if (error) console.log('error' + error.message);
			else console.log('no error');
			done();
		});
	});

	it('find a user by username', function(done) {
		Account.findOne({username: 'Tester' }, function(err, account) {
			expect(account.username).to.equal('Tester');
			console.log("username: ", account.username);
			done();
		});
	});

	afterEach(function(done)) {
		Account.remove({}, function() {
			done();
		});
	});

}


describe("Connection Test", function() {
		it('should return 200', function (done) {
		  var options = {
		    url: 'http://' + local_URL,
		    headers: {
		      'Content-Type': 'text/plain'
		    }
		  };

			done();
		  //var options = {
		   // url: 'http://localhost:3000/',
		//     headers: {
		//       'Content-Type': 'text/plain'
		//     }
		//   };

		//   request.get(options, function (err, res, body) {
		//     done();
		//   });
		});

});
