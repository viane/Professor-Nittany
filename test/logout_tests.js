// /* Libraries */
// const expect = require('chai').expect;
// const request = require('supertest');
// const appRoot = require('app-root-path');
// const express = require('express');
// const mongoose = require('mongoose');
// /* End Libraries */

// /* Run the Server */
// const app = require(appRoot + '/server');
// /* Connect to the server
// NOTE: Currently connecting directly to app (request.agent(app)) will
// cause a possible memory leak error. This is a problem with supertest.
// */
// const server = request.agent('http://localhost:3000');

// /* Initialize database and user schemas */
// const database = require(appRoot + '/config/database.js');
// const user = require(appRoot + '/app/models/user.js');

// /* !!!!!!!!!!!!!!!!! LOGOUT TESTS !!!!!!!!!!!!!!!!!!!!!!
// Included are:
// 1. A User can log out properly
// */
// describe('Logout Tests', function (done) {
//     /* Called Before every describe in this describe */
//     before(function (done) {
//         mongoose.createConnection(database.userDB_URL);
//         done();
//     });

//     //Called After every describe in this describe
//     after(function (done) {
//         mongoose.connection.close();
//         done();
//     });

//     afterEach(function (done) {
//         //Removes users with email intelligentacademicplanner@outlook.com
//         user.find({'local.email': 'intelligentacademicplanner@outlook.com'}).remove().exec(done);
//     });
    
//     /* Called before every test (it call) in this describe */
//     beforeEach(function (done) {
//         /* Create a new user and store it in the database */
//         var newUser = new user();
//         newUser.type = "local";
//         newUser.local.email = "intelligentacademicplanner@outlook.com";
//         newUser.hashPassword("Testing123");
//         newUser.local.displayName = "Tester";
//         newUser.local.account_role = "Student";
//         newUser.local.account_status = "active";
//         newUser.save();
//         /* Done creating user*/

//         /*Log user in */
//         server.post('/login').set('Content-Type', 'application/x-www-form-urlencoded').send({email: "intelligentacademicplanner@outlook.com", password: 'Testing123'}).end(function(err, res) {
//             if (err) {
//                 return done(err);
//             } else {
//                 done();
//             }
//         });
//         /* Done logging user in */
//     });

//     it('A user can log out properly', function(done) {
//        server.get('/logout').end( function (err, res) {
//           expect(res.statusCode).to.equal(302);
//           expect(res.headers['location']).to.equal('/');
//           done();
//       });
//    });
// });