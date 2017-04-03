/* Libraries */
const expect = require('chai').expect;
const request = require('supertest');
const appRoot = require('app-root-path');
const mongoose = require('mongoose');
/* End Libraries */

/* Run the Server */
const app = require(appRoot + '/server');
/* Connect to the server
NOTE: Currently connecting directly to app (request.agent(app)) will
cause a possible memory leak error. This is a problem with supertest.
*/
const server = request.agent('http://localhost:3000');
const io = require('socket.io-client');
var socket;
/* Initialize database and user schemas */
const database = require(appRoot + '/config/database.js');
const user = require(appRoot + '/app/models/user.js');
const question = require(appRoot + '/app/models/question.js');




describe('Ask Question Tests', function () {

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

	afterEach( function() {
		socket.disconnect();
	});

	it ('A user can ask a question', function (done) {
        var message = {};
        message.sender = {};
        message.sender.id = 0;
        message.content = "What is Unit Testing?";
		sendMessage(message);

		socket.on('answer', function (answer) {
			expect(answer.message).to.not.equal("");
			done();
		})
	});

	it ('The system will respond with a relevant answer', function (done) {
		var message = {};
        message.sender = {};
        message.sender.id = 0;
        message.content = "What is Computer Science?";
		sendMessage(message);

		socket.on('answer', function (answer) {
			expect(answer.message[0].body).to.include("Computer Science");
			done();
		});
	});

	it ('The system will provide multiple responses', function (done) {
		var message = {};
        message.sender = {};
        message.sender.id = 0;
        message.content = "What is Computer Science?";
		sendMessage(message);

		socket.on('answer', function (answer) {
			expect(answer.message.length).to.be.above(1);
			done();
		});
	});

	it('The system should store data unique to the user', function (done) {
		createUser( function() {
			logValidUserIn( function() {
				user.findOne({'local.email': 'intelligentacademicplanner@outlook.com'}).exec( function (err, newUser) {
					//if (err) return done(err);
					var message = {};
			        message.sender = {};
			        message.sender.id = newUser._id;
			        message.sender.type = newUser.type;
			        message.content = "What is Computer Science?";
			        sendMessage(message);
					socket.on('answer', function (answer) {
						expect(newUser.ask_history.length).to.be.above(0);
				    	//Removes users with email intelligentacademicplanner@outlook.com
				    	user.find({'local.email': 'intelligentacademicplanner@outlook.com'}).remove( function() {
				    		done();
				    	});
					});
				});
			});
		});
	});
	it('The system should keep track of asked questions', function (done) {
		createUser( function() {
			logValidUserIn( function() {
				user.findOne({'local.email': 'intelligentacademicplanner@outlook.com'}).exec( function (err, newUser) {
					//if (err) return done(err);
					var message = {};
			        message.sender = {};
			        message.sender.id = newUser._id;
			        message.sender.type = newUser.type;
			        message.content = "What is Computer Science?";
			        sendMessage(message);
					socket.on('answer', function (answer) {
						expect(newUser.local.ask_history[0].question_body).to.equal(message.content);
				    	//Removes users with email intelligentacademicplanner@outlook.com
				    	user.find({'local.email': 'intelligentacademicplanner@outlook.com'}).remove( function() {
				    		done();
				    	});
					});
				});
			});
		});
	});

	it('The user should be able to leave feedback for a question', function() {
		//Don't know how this will be implemented, so cannot test it right now.
	});
	it ('Should answer within 5 seconds', function (done) {
		var startTime = Date.now();
		var message = {};
        message.sender = {};
        message.sender.id = 0;
        message.content = "What is Computer Science?";
		sendMessage(message);

		socket.on('answer', function (answer) {
			expect(Date.now() - startTime).to.be.below(5000); //Less than 5 seconds.
			done();
		});
	});
});

/* HELPFUL FUNCTIONS */
function sendMessage(message) {
	socket = io.connect('http://localhost:3000');
    socket.on('connect', function() {
		socket.emit('load', message.sender);
		socket.emit('question', message);
	});
}

function createUser(callback) {
	var newUser = new user();
	newUser.type = "local";
	newUser.local.email = "intelligentacademicplanner@outlook.com";
	newUser.hashPassword("Testing123");
	newUser.local.displayName = "Tester";
	newUser.local.role = "Student";
    newUser.local.account_status = "active";
    newUser.local.ask_history = [{ question_body: "" }];
	newUser.save(callback);
}

function logValidUserIn(callback) {
	server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({
		email: "intelligentacademicplanner@outlook.com",
		password: 'Testing123'}).end(function (err, res) {
			if (err) return err;
			else callback();
		});
	}