/* Libraries */
const expect = require('chai').expect;
const request = require('supertest');
const appRoot = require('app-root-path');
const express = require('express');
const mongoose = require('mongoose');
/* End Libraries */

/* Other Files */
const app = require(appRoot + '/server');
const database = require(appRoot + '/config/database.js');
/* End Other Files */

var cookie;

describe("Connection Tests", function() {
		it('should connect to localhost', function (done) {
			request(app, function(error, response, body) {
				expect(response.statusCode).to.equal(200);
				expect(error).to.equal(null);
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