'use strict'

const watson = require('watson-developer-cloud');
const express = require('express');
const router = express.Router();

// If no API Key is provided here, the watson-developer-cloud@2.x.x library will check for an ALCHEMY_LANGUAGE_API_KEY environment property and then fall back to the VCAP_SERVICES property provided by Bluemix.
var alchemy_language = new watson.alchemy_language({api_key: 'ea13ccb3e466b472e9ea343480f3204d0e239d05'})

router.post("/analysis", function(req, res) {
    res.sendStatus(200);
})

module.exports = router;

module.exports.getAnalysis = function(inputString) {
    var parameters = {
        extract: 'concepts,entities,keywords,taxonomy',
        sentiment: 1,
        maxRetrieve: 50,
        text: inputString
    };

    return new Promise(function(resolve, reject) {
        alchemy_language.combined(parameters, function(err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
};
