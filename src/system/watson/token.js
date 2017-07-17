'use strict'

var express = require('express');

var router = express.Router();

var vcapServices = require('vcap_services'),
    extend       = require('util')._extend,
    watson       = require('watson-developer-cloud');

var config = extend({
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: '110115fe-46e5-42cd-a5c3-41a09be09375',
  password: 'UA8PfTGKRr60'
}, vcapServices.getCredentials('speech_to_text'));

var authService = watson.authorization(config);

// set up an endpoint to serve speech-to-text auth tokens

router.post('/token', function (req, res, next) {
  authService.getToken({url: config.url}, function(err, token) {
    if (err){
      throw err;
      res.status(500).send('Error retrieving token');
      return;
    }
    else{
      res.send(token);
    }
  });
})

module.exports = router
