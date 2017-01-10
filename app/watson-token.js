'use strict'

var express = require('express')
var router = express.Router() // eslint-disable-line new-cap
var vcapServices = require('vcap_services')
var extend = require('util')._extend
var watson = require('watson-developer-cloud')

// set up an endpoint to serve speech-to-text auth tokens

// For local development, replace username and password or set env properties
var sttConfig = extend({
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  password: 'UA8PfTGKRr60',
  username: '110115fe-46e5-42cd-a5c3-41a09be09375'
  }, vcapServices.getCredentials('speech_to_text'))

var sttAuthService = watson.authorization(sttConfig)

router.get('/token', function (req, res) {
  sttAuthService.getToken({url: sttConfig.url}, function (err, token) {
    if (err) {
      console.log('Error retrieving token: ', err)
      res.status(500).send('Error retrieving token')
      return
    }
    res.send(token)
  })
})

module.exports = router
