var express = require('express');
var router = express.Router();
var usersRouter = require('./users');
var questionRouter = require('./question');
var majorListRouter = require('./major-list');
const profileRouter = require('./profile');

module.exports = function(app) {
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.sendFile(__dirname+'index.html');
  });

  app.use('/users', usersRouter);
  app.use('/question', questionRouter);
  app.use('/major-list',majorListRouter);
  app.use('/profile', profileRouter);
}
