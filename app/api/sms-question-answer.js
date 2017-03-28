'use strict'
const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const twilioSMS = require('twilio')('AC986df3d5c5b5185f845ac46499758075', '8953462aa58c2dfaf97835ef40b26fc5');
const questionAnswer = require(appRoot + '/app/question-answer');

router.post('/sms-in', (req, res) => {
  twilioSMS.messages.create({
      to: req.body.From,
      from: req.body.To,
      body: "IAP response"
  }, (err, message) => {
      if (err) {
          console.error(err);
          return;
      }
      res.sendStatus(200);
  });  
});

module.exports = router;
