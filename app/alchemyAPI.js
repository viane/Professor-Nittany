'use strict'

const watson = require('watson-developer-cloud');
const express = require('express');
const router = express.Router();

// If no API Key is provided here, the watson-developer-cloud@2.x.x library will check for an ALCHEMY_LANGUAGE_API_KEY environment property and then fall back to the VCAP_SERVICES property provided by Bluemix.
var alchemyLanguage = new watson.AlchemyLanguageV1({
  api_key: 'ea13ccb3e466b472e9ea343480f3204d0e239d05'
})


module.exports = router
