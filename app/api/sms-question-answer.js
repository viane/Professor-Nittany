'use strict'
const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const twilioSMS = require('twilio')('AC986df3d5c5b5185f845ac46499758075', '8953462aa58c2dfaf97835ef40b26fc5');
const questionAnswer = require(appRoot + '/app/question-answer');

router.post('/sms-in', (req, res) => {
    // ask IAP as visitor
    questionAnswer.ask(null, req.body.Body).then(function(result) {
        // speak back with answer
        const answerBody = result.response.docs[0].body;
        twilioSMS.messages.create({
            to: req.body.From,
            from: req.body.To,
            body: answerBody
        }, (err, message) => {
            if (err) {
                console.error(err);
                return res.sendStatus(400);
            }
            res.sendStatus(200);
        });
    }).catch(function(err) {
        console.error(err);
        twilioSMS.messages.create({
            to: req.body.From,
            from: req.body.To,
            body: "There is an issue with the system, please try again later or contact us!"
        }, (err, message) => {
            if (err) {
                console.error(err);
                return res.sendStatus(400);
            }
            res.sendStatus(200);
        });
    });
});

module.exports = router;
