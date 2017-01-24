const should = require('chai').should;
const expect = require('chai').expect;
const request = require('request');
const assert = require('assert');
const appRoot = require('app-root-path');
const express = require('express');
const server = require(appRoot + '/server.js');

describe('Basic test', function() {
    it('should always pass', function(done) {
        assert.equal(1, 1);
        done();
    });
});


describe("Logout Functionality test", function() {
    //Suite Name
    // beforeEach(function(done) {
    //     done();
    // });
		//
    // afterEach(function(done) {
    //     done();
    // });

		it('should return 200', function (done) {
			

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
