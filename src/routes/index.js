const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const questionRouter = require('./questions');
const majorListRouter = require('./major-list');
const profileRouter = require('./profile');
import phoneRouter from './phone';
import devRouter from './dev';
import statusRouter from './status';

module.exports = function(app) {
  /* GET home page. */
  app.get('/', function(req, res, next) {
    res.sendFile(__dirname + 'lite-version.html');
  });

  app.use('/users', usersRouter);
  app.use('/questions', questionRouter);
  app.use('/major-list',majorListRouter);
  app.use('/profile', profileRouter);
  app.use('/phone', phoneRouter)
  app.use('/dev', devRouter)
  app.use('/status', statusRouter)
}
