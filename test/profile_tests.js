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

describe('Profile Tests', function() {
	it('should allow a user to input 100-600 words of academic description', function (done) {
		//userjs personality_assessment.description_content
		done();
	});
	it('should allow a user to input 100 words of self description', function (done) {
		//userjs personality_assessment.description_content
		done();
	});
	it('should allow a user to get their personality analyzed', function (done) {
		//userjs personality_assessment.evaluation
		done();
	});
	it('should allow a user to send an assessment', function (done) {
		//Socket.io - line 80 - emit client-send-assessment
		done();
	});
	it('should allow a user to specify what to send to advisors', function (done) {
		//Socket.io - line 80 - emit client-send-assessment
		done();
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