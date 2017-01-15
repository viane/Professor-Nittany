'use strict'

var express = require('express');

var router = express.Router();

var User = require('../app/models/user');

router.post('/apply-admin', function(req, res) {
    const id = req.user._id;
    const activationCode = req.body.code;
    if (validateActivationCode(activationCode)) {
        User.update({
            _id: id
        }, {
            $set: {
                "local.role": "admin"
            }
        })
        .exec()
        .then(function(updatedUser) {
            res.send({type: 'success', information: 'Successfully applied.', newUser: updatedUser});
        })
        .catch(function (err) {
            throw err
            res.send({type: 'error', information: err});
        })
    } else {
        res.send({type: 'error', information: 'Wrong invitation code.'}); // req.flash is the way to set flashdata using connect-flash
    }
});

const validateActivationCode = function(code) {
    const correctSecret = "bwqlrEfvDofy7nZC8NLDXFlbh92rbL2moCxBSrXv8stqPcZjeGJCpbJ2QF2yh2iTBnWpEorY5ll2KTfl91FBEc5IEqnQboOfV319Js8fan6gRKHXSBwqbNPy3oRcKENfHQbTBPPCZSz2VaG4pLIB2K7VzL4AD93w7iKrDMfYeggwUGKJf0tX6xAAUyQwZQO5Wswn00aYtPYwst19WlKoFl3eEUQRQ05qFrLP5WwbG7ALmZSLztCnysBKGtUWyFa2";
    if (code === correctSecret) {
        return true;
    } else {
        return false;
    }
}

module.exports = router;
