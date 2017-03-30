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


    /* !!!!!!!!!!!!!!!!! LOGIN TESTS !!!!!!!!!!!!!!!!!!!!!!
Included are:
1. A User can login with a proper email and password
2. A User cannot login with a incorrect password
3. A User cannot login with an incorrect email
4. A User should be logged in within 5 seconds
*/
describe('Login Tests', function(done) {
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
        //Removes users with email unittest@test.com
        user.find({'local.email': 'unittest@test.com'}).remove().exec(done);
    });
    /* Called before every test (it call) in this describe */
    beforeEach(function(done) {
        var newUser = new user();
        newUser.type = "local";
        newUser.local.email = "unittest@test.com";
        newUser.hashPassword("Testing123");
        newUser.local.displayName = "Tester";
        newUser.local.account_role = "Student";
        newUser.local.account_status = "active";
        newUser.save();
        done();
    });

    /* User is removed after each function already */

    it('A user can login with a proper email and password', function(done) {
        server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({email: "unittest@test.com", password: 'Testing123'}).end(function(err, res) {
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

    it('A user can login within 5 seconds', function(done) {
        var startTime = Date.now();
        server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({email: "unittest@test.com", password: 'Testing123'}).end(function(err, res) {
            if (err) {
                return done(err);
            } else {
                    expect(Date.now() - startTime).to.be.below(5000); //Less than 5 seconds.
                    done();
                }
            });
    });
});