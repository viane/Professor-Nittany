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

 /* !!!!!!!!!!!!!!!!! REGISTER TESTS !!!!!!!!!!!!!!!!!!!!!!
Included are:
1. A User can register with a proper username, password, and displayName
2. A User should be registered within 5 seconds
*/

describe('Register Tests', function(done) {
    /* Called Before every describe in this describe */
    before(function(done) {
        mongoose.createConnection(database.userDB_URL);
        done();
    });

    //Called After every describe in this describe
    after(function(done) {
        mongoose.connection.close();
        done();
    });

    afterEach(function(done) {
        //Removes users with email intelligentacademicplanner@outlook.com
        user.find({'local.email': 'intelligentacademicplanner@outlook.com'}).remove().exec(done);
    });


    it('A user can register with a proper username, password, and displayName', function(done) {
        server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
            {first_name: "noProblems",
            last_name: "registerTest",
            email: "intelligentacademicplanner@outlook.com",
            password: "Testing123",
            account_role: "Student",
            account_status: "active"}).end(function(err, res) {
                if (err) {
                    return done(err);
                } else {
                    expect(res.statusCode).to.equal(200);
                    expect(res.text).to.include('\"type\":\"success\"');
                    expect(res.text).to.include("Successfully registered");
                    done();
                }
            });
        });

    it('A user should register within 5 seconds', function(done) {
            var startTime = Date.now(); //Get time that the function started.
            server.post('/signup').set('Content-Type', 'application/x-www-form-urlencoded').send(
                {first_name: "LoginWithinTimeLimit",
                last_name: "registerTest",
                email: "intelligentacademicplanner@outlook.com",
                password: "Testing123",
                account_role: "Student",
                account_status: "active"
            }).end(function(err, res) {
                if (err) {
                    return done(err);
                } else {
                    expect(Date.now() - startTime).to.be.below(5000); //Less than 5 seconds
                    done();
                }
            });
        });
});