/* Libraries */
const expect = require('chai').expect;
const request = require('supertest');
const appRoot = require('app-root-path');
const express = require('express');
const mongoose = require('mongoose');
/* End Libraries */

/* Other Files */
const app = require(appRoot + '/server');
const server = request.agent(app);
const database = require(appRoot + '/config/database.js');
const user = require(appRoot + '/app/models/user.js');
const passportMock = require(appRoot + '/test/passport-mock.js');
/* End Other Files */

var cookie;

 //Login, Logout, Register
describe('Login, Logout, Register Tests', function() {
	/* Called Before every describe in this describe */
	before(function (done) {
		db = mongoose.createConnection(database.userDB_URL);
		done();
	});

	 //Called After every describe in this describe 
	after(function (done) {
		mongoose.connection.close();
		done();
	});

	describe('Register Tests', function(done) {

		afterEach( function(done) {
			user.remove();
			done();
		});

		it('should register a new user', function (done) {
			server.post('/signup')
			.set('Content-Type','application/x-www-form-urlencoded')
			.send( {
				local: {
					email: "Tester@test.com",
					password: "password",
					displayName: "Tester"
				}
			})
			.end( function (err, res) {
				console.log(res.body);
				if (err) {
					return done(err);
				} else {
					expect(res.statusCode).to.equal(302);
					expect(res.text).to.include('/profile');
					done();
				}
			});
		});
	});

	
	describe('Login Tests', function (done) {
		/* Called before every test (it call) in this describe */
		beforeEach( function (done) {
			var newUser = new user();
            newUser.type = "local";
            newUser.local.email = "tester@test.com"; 
            newUser.hashPassword("testing123"); 
            newUser.local.displayName = "Tester";
            newUser.save();
            done();
        });
			
		/* Called after every test (it call) in this describe */
		afterEach( function (done) {
			user.remove();
			done();
		});

		it('should login the user', function (done) {
			passportMock(app, {
				passAuthentication: true,
				email: "tester@test.com",
				password: 'testing123'
			});

			server.post('/mock/login')
			.set('Content-Type','application/x-www-form-urlencoded')
			.send({
				local : {
					email : "tester@test.com",
					password: 'testing123'
				}
			}).end( function (err, res) {
				if (err) {
					return done(err);
				} else {
					console.log(res);
					expect(res.statusCode).to.equal(302);
					expect(res.text).to.include('/profile');
					done();
				}
			});
		});
	});

	describe('Logout Tests', function() {

	});
});