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
const question = require(appRoot + '/app/models/question.js');

describe('Unit Testing', function () {
	/* Called once before a describe */
	before(function (done) {
		mongoose.createConnection(database.userDB_URL);
		done();
		});

	/* Called once after a describe */
	after(function (done) {
		mongoose.connection.close();
		done();
		});

	afterEach( function (done) {
    	//Removes users with email unittest@test.com
    	user.find({'local.email': 'unittest@test.com'}).remove().exec(done);
	});
	describe('~!~!~!~!~Routes.js File~!~!~!~!~', function () {
		describe('~~~~~Home Page~~~~~', function (done) {
			it('Should access page / with no problems.', function (done) {
				server.get('/').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.statusCode).to.equal(200);
						done();
					}
				})
				});
			});
		describe('~~~~~Login~~~~~', function (done) {
			/* Called before every test (it call) in this describe */
			beforeEach(function (done) {
				createUser(done());
				});
			it('Should redirect to Profile page if autheticated', function (done) {
				logValidUserIn(function () {
					server.get('/login').end(function (error, response) {
						if (error) {
							return done(error);
						}
						else {
							expect(response.redirect).to.equal(true);
							expect(response.statusCode).to.equal(302);
							expect(response.headers.location).to.equal('/profile');
							done();
						}
					});
				});
				});
			it ('Should stay on login page if not authenticated', function (done) {
				server.get('/login').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(false);
						expect(response.statusCode).to.equal(200);
						done();
					}
				});
				});
			it ('Should not login user if there is no email provided OR email is empty', function (done) {
				server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
					email: "",
					password: 'Testing123'}).end(function(err, res) {
						if (err) {
							return done(err);
						} else {
							expect(res.statusCode).to.equal(200);
							expect(res.text).to.include('\"type\":\"error\"');
							expect(res.text).to.include('\"information\":\"Email can\'t be empty\"');
							done();
						}
					});
				});
			it ('Should not login user if there is no password provided OR password is empty', function (done) {
				server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
					email: "foo@test.com",
					password: ''}).end(function(err, res) {
						if (err) {
							return done(err);
						} else {
							expect(res.statusCode).to.equal(200);
							expect(res.text).to.include('\"type\":\"error\"');
							expect(res.text).to.include('\"information\":\"Password can\'t be empty\"');
							done();
						}
					});
				});
			it('Should not log in user if it is not a valid email', function (done) {
				server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
					email: "foo",
					password: 'Testing123'}).end(function(err, res) {
						if (err) {
							return done(err);
						} else {
							expect(res.statusCode).to.equal(200);
							expect(res.text).to.include('\"type\":\"error\"');
							expect(res.text).to.include('\"information\":\"Invalid email\"');
							done();
						}
					});
				});
			describe('------Passport Authentication Tests - Login------', function() {
				it('Should not log in user if email doesn\'t exist', function (done) {
					server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
						email: "foo@test.com",
						password: 'Testing123'}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Can\'t find any user with this email\"');
								done();
							}
						});
					});
				it('Should not log in user if password is incorrect', function (done) {
					server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
						email: "unittest@test.com",
						password: 'incorrectPassword'}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Password incorrect\"');
								done();
							}
						});
					});
					});
			it ('Should properly log in user if no problems', function (done) {
				server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
					email: "unittest@test.com",
					password: 'Testing123'}).end(function(err, res) {
						if (err) {
							return done(err);
						} else {
							expect(res.statusCode).to.equal(200);
							expect(res.text).to.include('\"type\":\"success\"');
							expect(res.text).to.include('\"information\":\"Login success\"');
							done();
						}
					});
				});
				});
		describe('~~~~~Signup~~~~~', function (done) {
			describe('------checkSignUpParameter Tests------', function (done) {
				it('user cannot register with empty first name', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "",
						last_name: "Tester",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "Student",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Name can\'t be empty\"');
								done();
							}
						});
					});
				it('user cannot register with empty last name', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "Tester",
						last_name: "",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "Student",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Name can\'t be empty\"');
								done();
							}
						});
					});
				it('user cannot register with empty email', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "",
						password: "Testing123",
						account_role: "Student",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Email can\'t be empty\"');
								done();
							}
						});
					});
				it('user cannot register with empty password', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "unittest@test.com",
						password: "",
						account_role: "Student",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Password can\'t be empty\"');
								done();
							}
						});
					});
				it('user cannot register with empty account role', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Invalid account role\"');
								done();
							}
						});
					});
				it('user cannot register as an admin with no admin token', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "Admin",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Missing admin token for registering as admin\"');
								done();
							}
						});
					});
				it('user cannot register as an advisor with no advisor token', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "Advisor",
						account_status: "active"}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include('\"type\":\"error\"');
								expect(res.text).to.include('\"information\":\"Missing advisor token for registering as advisor\"');
								done();
							}
						});
					});
				it('user cannot register as an admin with an invalid admin token', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "Admin",
						account_status: "active",
						['admin-token']: "HireMe"
					}).end(function(err, res) {
						if (err) {
							return done(err);
						} else {
							expect(res.statusCode).to.equal(200);
							expect(res.text).to.include('\"type\":\"error\"');
							expect(res.text).to.include('\"information\":\"Invalid admin token\"');
							done();
						}
					});
					});
				it('user cannot register as an advisor with an invalid advisor token', function (done) {
					server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
						{first_name: "incorrectPassword",
						last_name: "registerTest",
						email: "unittest@test.com",
						password: "Testing123",
						account_role: "Advisor",
						account_status: "active",
						['advisor-token']: "ImAProfessor"
					}).end(function(err, res) {
						if (err) {
							return done(err);
						} else {
							expect(res.statusCode).to.equal(200);
							expect(res.text).to.include('\"type\":\"error\"');
							expect(res.text).to.include('\"information\":\"Invalid advisor token\"');
							done();
						}
					});
					});
				describe('------Local SignUp Passport Tests------', function (done) {
					it('user cannot register if invalid email', function (done) {
						server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
							{first_name: "Tester",
							last_name: "Tester",
							email: "unittest",
							password: "Testing123",
							account_role: "Student",
							account_status: "active"}).end(function(err, res) {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).to.equal(200);
									expect(res.text).to.include('\"type\":\"error\"');
									expect(res.text).to.include('\"information\":\"Email not valid\"');
									done();
								}
							});
						});
					it('A user cannot register with a taken email', function (done) {
						createUser(function () {
							server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
							{first_name: "takenEmail",
							last_name: "registerTest",
							email: "unittest@test.com",
							password: "Testing123",
							account_role: "Student",
							account_status: "active"}).end(function(err, res) {
								if (err) {
									return done(err);
								} else {
									expect(res.statusCode).to.equal(200);
									expect(res.text).to.include('\"type\":\"error\"');
									expect(res.text).to.include('\"information\":\"Email already registered\"');
									done();
								}
							});
						});
						});
					it('user should be saved as Student in database if registered as Student', function (done) {
						server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
							{first_name: "noProblems",
							last_name: "registerTest",
							email: "unittest@test.com",
							password: "Testing123",
							account_role: "Student",
							account_status: "active"}).end(function(err, res) {
								if (err) {
									console.log(err);
									return done(err);
								} else {
									user.findOne({'local.email': 'unittest@test.com'}).exec( function (err, newUser) {
										if (err) return done(err);
										else {
											expect(newUser.local.role).to.equal("student");
											done();
										}
									});
								}
							});
						});
					it('user should be saved as Advisor in database if registered as Advisor', function (done) {
						server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
							{first_name: "noProblems",
							last_name: "registerTest",
							email: "unittest@test.com",
							password: "Testing123",
							account_role: "Advisor",
							account_status: "active",
							['advisor-token']: "b2aP7l3PMqjnL1cZNDGIyWBoM5i2BW22oyUAFxEZo3Afv0vtGzRPt1mcrcNLPqoxxqDJunVWbie4CZ6hDXRwVMF1YMDGMHjXP5nCXb2UF1VY3K1cpefpKEoAzyeaKzTT"
						}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								user.findOne({'local.email': 'unittest@test.com'}).exec( function (err, newUser) {
									if (err) return done(err);
									else {
										expect(newUser.local.role).to.equal("advisor");
										done();
									}
								});
							}
						});
						});
					it('user should be saved as Admin in database if registered as Admin', function (done) {
						server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
							{first_name: "noProblems",
							last_name: "registerTest",
							email: "unittest@test.com",
							password: "Testing123",
							account_role: "Admin",
							account_status: "active",
							['admin-token']: "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2"
						}).end(function(err, res) {
							if (err) {
								return done(err);
							} else {
								user.findOne({'local.email': 'unittest@test.com'}).exec( function (err, newUser) {
									if (err) return done(err);
									else {
										expect(newUser.local.role).to.equal("admin");
										done();
									}
								});
							}
						});
						});
					it('should store user in database properly', function (done) {
						server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
							{first_name: "noProblems",
							last_name: "registerTest",
							email: "unittest@test.com",
							password: "Testing123",
							account_role: "Student",
							account_status: "active"}).end(function(err, res) {
								if (err) {
									return done(err);
								} else {
									user.findOne({'local.email': 'unittest@test.com'}).exec( function (err, newUser) {
										if (err) return done(err);
										else {
											expect(newUser.local).to.not.equal(undefined);
											expect(newUser.local.email).to.equal("unittest@test.com");
											expect(newUser.password).to.equal(newUser.hashPassword("Testing123"));
											expect(newUser.local.first_name).to.equal("noProblems");
											expect(newUser.local.last_name).to.equal("registerTest");
											expect(newUser.local.displayName).to.equal("noProblems registerTest");
											expect(newUser.local.role).to.equal("student");
											expect(res.statusCode).to.equal(200);
											expect(res.text).to.include('\"type\":\"success\"');
											expect(res.text).to.include("Successfully registered");
											done();
										}
									});
								}
							});
						});
					});	
				});
			});
		describe('~~~~~Profile~~~~~', function (done) {
				it('user should be redirected to login page if not logged in and accessing /profile', function (done) {
					server.get('/profile').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(true);
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/login');
						done();
					}
					});
				});
				describe('requires authentication requests to profile', function (done) {

					it ('/profile should successfully navigate to profile if logged in', function (done) {
						createUser( function () {
							logValidUserIn( function () {
							server.get('/profile').end(function (error, response) {
							if (error) {
								return done(error);
							}
							else {
								expect(response.statusCode).to.equal(200);
								done();
							}
							});
						});
						});
					});
					it ('/profile should return error for invalid type', function (done) {			
							var newUser = new user();
							newUser.type = "blah!";
							newUser.local.email = "unittest@test.com";
							newUser.hashPassword("Testing123");
							newUser.local.name = "Tester";
							newUser.local.account_role = "Student";
        					newUser.local.account_status = "active";
							newUser.save();
							logValidUserIn( function () {
								server.get('/profile').end(function (error, response) {
								if (error) {
									return done(error);
								}
								else {
									expect(response.statusCode).to.not.equal(200);
									expect(response.text).to.include("Request user type is unexcepted");
									done();
								}
							});
						});
					});
				});
			});
		describe('~~~~~NonLocal Login/SignUp~~~~~', function (done) {
			it('should connect to facebook for auth', function (done) {
				server.get('/auth/facebook').end( function (err, res) {
					if (err) done(err);
					else {
						expect(res.statusCode).to.equal(302);
						expect(res.headers.location).to.include('facebook');
						done();
					}
				});
			});
			it('should connect to twitter for auth', function (done) {
				server.get('/auth/twitter').end( function (err, res) {
					if (err) done(err);
					else {
						expect(res.statusCode).to.equal(302);
						expect(res.headers.location).to.include('twitter');
						done();
					}
				});
			});
			it('should connect to google for auth', function (done) {
				server.get('/auth/google').end( function (err, res) {
					if (err) done(err);
					else {
						expect(res.statusCode).to.equal(302);
						expect(res.headers.location).to.include('google');
						done();
					}
				});
			});
			it('should connect to linkedin for auth', function (done) {
				server.get('/auth/linkedin').end( function (err, res) {
					if (err) done(err);
					else {
						expect(res.statusCode).to.equal(302);
						expect(res.headers.location).to.include('linkedin');
						done();
					}
				});
			});
			});
		describe('~~~~~Inbox~~~~~', function (done) {
			it('user should be redirected to login page if not logged in and accessing /inbox', function (done) {
					server.get('/inbox').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(true);
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/login');
						done();
					}
					});
				});
			it('Should access page /inbox with no problems if user is logged in.', function (done) {
				createUser( function () {
					logValidUserIn( function () {
					server.get('/inbox').end(function (error, response) {
						if (error) {
							return done(error);
						}
						else {
							expect(response.statusCode).to.equal(200);
							done();
						}
						});
					});
				});	
			});
			});
		describe('~~~~~Advising~~~~~', function (done) {
			it('user should be redirected to login page if not logged in and accessing /advising', function (done) {
					server.get('/advising').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(true);
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/login');
						done();
					}
					});
				});
			it('should not access page if user is not an advisor', function (done) {
				createUser( function() {
					logValidUserIn ( function () {
						server.get('/advising').end(function (error, response) {
						if (error) {
							return done(error);
						}
						else {
							expect(response.statusCode).to.not.equal(200);
							done();
						}
						});
					});
				});
			});
			it('Should access page /advising with no problems if user is logged in as an advisor', function (done) {
				var newUser = new user();
				newUser.type = "local";
				newUser.local.email = "unittest@test.com";
				newUser.hashPassword("Testing123");
				newUser.local.displayName = "Tester";
				newUser.local.role = "advisor";
				newUser.local.account_status = "active";
				newUser.save();
				logValidUserIn( function () {
				server.get('/advising').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.statusCode).to.equal(200);
						done();
					}
					});
				});
			});
			});
		describe('~~~~~Logout~~~~~', function (done) {
			it('Should logout with no problems', function (done) {
				server.get('/logout').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/');
						done();
					}
				})
				});
			});
		describe('~~~~~Admin~~~~~', function (done) {
			it('user should be redirected to login page if not logged in and accessing /admin', function (done) {
					server.get('/admin').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(true);
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/login');
						done();
					}
					});
				});
			it('should not access page if user is not an admin', function (done) {
				createUser( function() {
					logValidUserIn ( function () {
						server.get('/admin').end(function (error, response) {
						if (error) {
							return done(error);
						}
						else {
							expect(response.statusCode).to.not.equal(200);
							done();
						}
						});
					});
				});
			});
			it('Should access page /admin with no problems if user is logged in as an admin', function (done) {
				var newUser = new user();
				newUser.type = "local";
				newUser.local.email = "unittest@test.com";
				newUser.hashPassword("Testing123");
				newUser.local.displayName = "Tester";
				newUser.local.role = "admin";
				newUser.local.account_status = "active";
				newUser.local['admin-token'] = "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2";		
				newUser.save();
				logValidUserIn( function () {
				server.get('/admin').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.statusCode).to.equal(200);
						done();
					}
					});
				});
			});
			});
	 	describe('~~~~~QAManagement~~~~~', function (done) {
			it('user should be redirected to login page if not logged in and accessing /QuestionAnswerManagement', function (done) {
					server.get('/QuestionAnswerManagement').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(true);
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/login');
						done();
					}
					});
				});
			it('should not access page if user is not an admin', function (done) {
				createUser( function() {
					logValidUserIn ( function () {
						server.get('/QuestionAnswerManagement').end(function (error, response) {
						if (error) {
							return done(error);
						}
						else {
							expect(response.statusCode).to.not.equal(200);
							done();
						}
						});
					});
				});
			});
			it('Should access page /QuestionAnswerManagement with no problems if user is logged in as an admin', function (done) {
				var newUser = new user();
				newUser.type = "local";
				newUser.local.email = "unittest@test.com";
				newUser.hashPassword("Testing123");
				newUser.local.displayName = "Tester";
				newUser.local.role = "admin";
				newUser.local.account_status = "active";
				newUser.save();
				logValidUserIn( function () {
				server.get('/QuestionAnswerManagement').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.statusCode).to.equal(200);
						done();
					}
					});
				});
			});
			});
		describe('~~~~~postQA~~~~~', function (done) {
			afterEach( function (done) {
				question.find({'question_body': 'What\'s unit testing'}).remove().exec(done);
			});

			it('should redirect user to login page if not logged in and accessing /postQuestionAnswer', function (){
				server.post('/postQuestionAnswer').end ( function (err, res) {
					if (err) done(err);
					else {
						expect(res.redirect).to.equal(true);
						expect(res.statusCode).to.equal(302);
						expect(res.headers.location).to.equal('/login');
					}
				});
			});
			it('should return error if question is empty', function (done) {
				createUser( function() {
					logValidUserIn( function () {
						server.post('/postQuestionAnswer').send({
							question: '',
							answer: 'Hi',
							tag: 'Hi'
						}).end( function (err, res) {
							if (err) done(err);
							else {
								expect(res.statusCode).to.equal(200);
								expect(res.text).to.include("Question can not be empty");
								done();
							}
						});
					});
				});
			});
			it('should find question in database', function () {
				createUser( function() {
					logValidUserIn( function() {
						server.post('/postQuestionAnswer').send({
							question: 'What\'s unit testing',
							answer: 'Unit testing is checking code line-by-line for correctness'
						}).end( function (err, res) {
							if (err) done(err);
							else {
								var u;
								user.findOne({'local.email': 'unittest@test.com'}).exec( function (err, newU) {
									if (err) done(err);
									else 
										{
											u = newU;
											question.findOne({'question_body': 'What\'s unit testing'}).exec(function (err, newQ) {
												expect(res.statusCode).to.equal(200);
												expect(newQ.question_body).to.equal('What\'s unit testing');
												expect(newQ.question_answer).to.equal('Unit testing is checking code line-by-line for correctness');
												expect(newQ.question_submitter).to.equal(u._id);
												expect(newQ.question_upload_method).to.equal("mannual");
												expect(res.text).to.include("Successfully added entry");
												done();
											});
										}
								});
								
							}
						});
					});
				});
			});
			});
		describe('~~~~~SystemManagement~~~~~', function (done) {
			it('user should be redirected to login page if not logged in and accessing /SystemManagement', function (done) {
					server.get('/SystemManagement').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.redirect).to.equal(true);
						expect(response.statusCode).to.equal(302);
						expect(response.headers.location).to.equal('/login');
						done();
					}
					});
				});
			it('should not access page if user is not an admin', function (done) {
				createUser( function() {
					logValidUserIn ( function () {
						server.get('/SystemManagement').end(function (error, response) {
						if (error) {
							return done(error);
						}
						else {
							expect(response.statusCode).to.not.equal(200);
							done();
						}
						});
					});
				});
			});
			it('Should access page /SystemManagement with no problems if user is logged in as an admin', function (done) {
				var newUser = new user();
				newUser.type = "local";
				newUser.local.email = "unittest@test.com";
				newUser.hashPassword("Testing123");
				newUser.local.displayName = "Tester";
				newUser.local.role = "admin";
				newUser.local.account_status = "active";
				newUser.local['admin-token']= "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2";
				newUser.save();
				logValidUserIn( function () {
				server.get('/SystemManagement').end(function (error, response) {
					if (error) {
						return done(error);
					}
					else {
						expect(response.statusCode).to.equal(200);
						done();
					}
					});
				});
			});
			});
	});
});

/* HELPFUL FUNCTIONS */
function createUser(callback) {
	var newUser = new user();
	newUser.type = "local";
	newUser.local.email = "unittest@test.com";
	newUser.hashPassword("Testing123");
	newUser.local.displayName = "Tester";
	newUser.local.role = "Student";
    newUser.local.account_status = "active";
	newUser.save();
	callback();
}
function logValidUserIn(callback) {
	server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
		email: "unittest@test.com",
		password: 'Testing123'}).end(function (err, res) {
			if (err) return err;
			else callback();
		});
	}