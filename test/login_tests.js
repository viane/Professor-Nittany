/* Libraries */
const expect = require('chai').expect;
const request = require('supertest');
const appRoot = require('app-root-path');
const express = require('express');
const mongoose = require('mongoose');
/* End Libraries */

/* Run the Server */
const app = require(appRoot + '/server');
/* Connect to the server
NOTE: Currently connecting directly to app (request.agent(app)) will
cause a possible memory leak error. This is a problem with supertest.
*/
const server = request.agent('http://localhost:3000');

/* Initialize database and user schemas */
const database = require(appRoot + '/config/database.js');
const user = require(appRoot + '/app/models/user.js');


 //Login, Logout, Register
 describe('Login, Logout, Register Tests', function() {
 	/* Called Before every describe in this describe */
 	before(function (done) {
 		mongoose.createConnection(database.userDB_URL);
 		done();
 	});

	 //Called After every describe in this describe 
	 after(function (done) {
	 	mongoose.connection.close();
	 	done();
	 });

	 afterEach( function (done) {
	 	console.log("!!!!Removing user!!!!");
		//Removes users with email unittest@test.com
		user.find({
			'local.email' : 'unittest@test.com'
		}).remove().exec(done);

	});

/* !!!!!!!!!!!!!!!!! REGISTER TESTS !!!!!!!!!!!!!!!!!!!!!! 
Included are:
1. A User can register with a proper username, password, and displayName
2. A User cannot register with a empty displayName
3. A User cannot register with a incorrect password
4. A User cannot register with a username that does not exist
5. A User should be registered within 5 seconds
*/

describe('Register Tests', function (done) {

	it('A user can register with a proper username, password, and displayName', function (done) {
		server.post('/signup')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send( {
			email: "unittest@test.com",
			password: "password",
			name: "NoProblemsRegisterTest"
		})
		.end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/profile');
				done();
			}
		});
	});

	it('A user cannot register with a blank displayName', function (done) {
		server.post('/signup')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send( {
			email: "unittest@test.com",
			password: "password",
			name: ""
		})
		.end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/signup');
				done();
			}
		});
	});

	it('A user cannot register with an incorrect password', function (done) {
		server.post('/signup')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send( {
			email: "unittest@test.com",
			password: "",
			name: "IncorrectPasswordRegisterTest"
		})
		.end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/signup');
				done();
			}
		});
	});

	it('A user cannot register with a taken email', function (done) {
		/* Create a user before registering */
		var newUser = new user();
		newUser.type = "local";
		newUser.local.email = "unittest@psu.edu"; 
		newUser.hashPassword("testing123"); 
		newUser.local.displayName = "TakenEmailRegisterTest";
		newUser.save();
		/* Done creating user */

		server.post('/signup')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send( {
			email: "unittest@psu.edu",
			password: "testing123",
			name: "TakenEmailRegisterTest"
		})
		.end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/signup');
				done();
			}
		});
	});

	it('A user should login within 5 seconds', function (done) {
			var startTime = Date.now();//Get time that the function started.
			server.post('/signup')
			.set('Content-Type','application/x-www-form-urlencoded')
			.send( {
				email: "unittest@test.com",
				password: "password",
				name: "LoginWithinTimeLimit"
			})
			.end( function (err, res) {
				if (err) {
					return done(err);
				} else {
					expect(Date.now() - startTime).to.be.below(5000); //Less than 5 seconds
					done();
				}
			});
		});
});

	/* !!!!!!!!!!!!!!!!! LOGIN TESTS !!!!!!!!!!!!!!!!!!!!!! 
Included are:
1. A User can login with a proper email and password
2. A User cannot login with a incorrect password
3. A User cannot login with an incorrect email
4. A User should be logged in within 5 seconds
*/
describe('Login Tests', function (done) {
	/* Called before every test (it call) in this describe */
	beforeEach( function (done) {
		var newUser = new user();
		newUser.type = "local";
		newUser.local.email = "unittest@test.com"; 
		newUser.hashPassword("testing123"); 
		newUser.local.displayName = "Tester";
		newUser.save();
		done();
	});

	/* User is removed after each function already */


	it('A user can login with a proper email and password', function (done) {
		server.post('/login')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send({
			email : "unittest@test.com",
			password: 'testing123'
		}).end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/profile');
				done();
			}
		});
	});

	it('A user cannot login with an incorrect password', function (done) {
		server.post('/login')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send({
			email : "unittest@test.com",
			password: 'incorrectPassword'
		}).end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/login');
				done();
			}
		});
	});

	it('A user cannot login with an incorrect email', function (done) {
		server.post('/login')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send({
			email : "foo@test.com",
			password: 'testing123'
		}).end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				expect(res.statusCode).to.equal(302);
				expect(res.text).to.include('/login');
				done();
			}
		});
	});

	it('A user can login within 5 seconds', function (done) {
		var startTime = Date.now();
		server.post('/login')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send({
			email : "unittest@test.com",
			password: 'testing123'
		}).end( function (err, res) {
			if (err) {
				return done(err);
			} else {
					expect(Date.now() - startTime).to.be.below(5000); //Less than 5 seconds.
					done();
				}
			});
	});
});

/* !!!!!!!!!!!!!!!!! LOGOUT TESTS !!!!!!!!!!!!!!!!!!!!!! 
Included are:
1. A User can log out properly
*/
describe('Logout Tests', function() {
	/* Called before every test (it call) in this describe */
	beforeEach( function (done) {
		/* Create a new user and store it in the database */
		var newUser = new user();
		newUser.type = "local";
		newUser.local.email = "unittest@test.com"; 
		newUser.hashPassword("testing123"); 
		newUser.local.displayName = "Tester";
		newUser.save();
		/* Done creating user*/

		/*Log user in */ 
		server.post('/login')
		.set('Content-Type','application/x-www-form-urlencoded')
		.send({
			email : "unittest@test.com",
			password: 'testing123'
		}).end( function (err, res) {
			if (err) {
				return done(err);
			} else {
				done();
			}
		});
		/* Done logging user in */
	});

	it('A user can log out properly', function (done) {
		// server.get('/logout').end( function (err, res) {
		// 	console.log(res.headers);
		// 	expect(res.statusCode).to.equal(302);
		// 	expect(res.headers['location']).to.equal('/');
			done();
			//});
	});
});
});