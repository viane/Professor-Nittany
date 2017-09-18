const express = require('express');
const router = express.Router();
const Verify = require('../system/utility/verify');
import Ticket from '../models/ticket';

router.get('/get-ticket', Verify.verifyOrdinaryUser, function(req, res, next) {
  Ticket.find({
    submitter: req.decoded._id
  },{submitter:0}, (err, tickets) => {
    if (err) {
      console.error(err);
      res.status(300).json({status: 'failed', err: err})
    }
    res.status(200).json({status: 'success', tickets: tickets})
  })
})

router.post("/submit-ticket", Verify.verifyOrdinaryUser, function(req, res, next) {
  if (req.body.title.length === 0 || req.body.comment.length == 0) {
    res.status(200).json({status: "Invalid input"});
  }
  const ticket = new Ticket();
  ticket.title = req.body.title;
  ticket.comment = req.body.comment;
  ticket.submitter = req.decoded._id;
  ticket.status = 'open';
  ticket.save().then(savedTicket => {
    res.status(200).json({status: 'success', ticket: savedTicket});
  }).catch(err => {
    console.error(err);
    res.status(300).json({status: 'error', err});
  })

});

module.exports = router;
