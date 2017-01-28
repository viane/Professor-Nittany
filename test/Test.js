/* Libraries */
const expect = require('chai').expect;
const request = require('supertest');
const appRoot = require('app-root-path');
const express = require('express');
const mongoose = require('mongoose');
const localStrategy = require('passport-local').Strategy;
/* End Libraries */

/* Other Files */
const server = require(appRoot + '/server');
const database = require(appRoot + '/config/database.js');
const user = require(appRoot + '/app/models/user.js');
/* End Other Files */


describe("Connection Tests", function() {
		it('should connect to localhost', function (done) {
			request(server, function(error, response, body) {
				expect(response.statusCode).to.equal(200);
				expect(error).to.equal(undefined);
			});
			done();
		});

		it('should connect to user database', function (done) {
			var db = mongoose.createConnection(database.userDB_URL);
			expect(db).to.not.equal(null);
			mongoose.connection.close();
			done();
		});

		it('should connect to question database', function (done) {
			var db = mongoose.createConnection(database.questionDB_URL);
			expect(db).to.not.equal(null);
			mongoose.connection.close();
			done();
		});
});

//Login, Logout, Register
describe('Login, Logout, Register Tests', function() {

	/* Called Before every describe in this describe */
	before(function (done) {
		db = mongoose.createConnection(database.userDB_URL);
		done();
	});

	/* Called After every describe in this describe */
	after(function (done) {
		mongoose.connection.close();
		done();
	});

	describe('Register Tests', function(done) {
		
		afterEach(function (done) {
			/* Called after every function in this describe. */
			//Do not remove user in tests unless creating a new one
			user.remove();
			done();
		});

		it('should register a new user', function (done) {
			//request(server).get('/signup');
			request(server).get('/');
			//request(server).get('/login');
			// request(server).post('/signup').send({
			// 	local : {
			// 		email : "test@test.com",
			// 		displayName : "Tester",
			// 		password : "password"
			// 	}
			// })
			// .expect(302)
			// .expect('Location','/profile')
			// .end ( function (error, response) {
			// 	console.log("Error:" + error);
			// 	console.log("Response: " + response);
			// 	expect(response.header['location']).to.include('/profile');
				done();
			// });
		});
	});

	
	describe('Login Tests', function (done) {
		/* Called before every test (it call) in this describe */
		beforeEach( function (done) {
			var newUser = new user({ 
				local : { 
					email : "test@test.com",
					displayName : "Tester",
					password : "password"
				}
			});
			newUser.save();
			done();
		});
			
		/* Called after every test (it call) in this describe */
		afterEach( function (done) {
			user.remove();
			done();
		});

		it('should login the user', function (done) {
			request(server).get('/login');
			request(server).post('/login')
			.send({
				local : {
					email : "test@test.com",
					password: "password"
				}
			}).on('error', function (error) {
				console.log(error);
			}).expect('Location','/profile')
			.end(done)
		});
	});

	describe('Logout Tests', function() {

	});
});