// var should = require('chai').should;
//const expect = require('chai').expect;
// var request = require('request');
// var express = require('express');
// var app = express();

// var baseUrl = "localhost:3000";

describe("Logout Functionality", function () {
	var expect = require('chai').expect;
	//Suite Name
	var server;

	beforeEach(function (done) {
		server = require('../server.js');
    	done();
    });

	afterEach(function (done) {
		server.close();
		done();
	});

	it ('Responds to /', function testSlash(done) {
		request(server).get('/').expect(404, done);
	});
	it ('should be correct.', function() {
		expect(2).to.equal(2);
	});
});