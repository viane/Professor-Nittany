'use strict'

const appRoot = require('app-root-path');

const express = require('express');

const router = express.Router();

let User = require(appRoot + '/app/models/user');

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
        }).exec().then(function(updatedUser) {
            res.send({type: 'success', information: 'Successfully applied.', newUser: updatedUser});
        }).catch(function(err) {
            throw err
            res.send({type: 'error', information: err});
        })
    } else {
        res.send({type: 'error', information: 'Wrong invitation code.'}); // req.flash is the way to set flashdata using connect-flash
    }
});

// /profile get user interests
router.get('/get-interest', (req, res) => {
    User.findById(req.user._id).exec().then(function(foundUser) {
        const interestPath = getInterestPathFromUser(foundUser);
        res.send({status: "success", information: "good", interest: foundUser[interestPath].interest});
    }).catch(function(err) {
        throw err;
        res.send({type: 'error', information: err});
    })
})

router.post('/favorite-question', function(req, res) {
    const id = req.user._id;
    console.log(req.user);
    res.send({status: "success", information: "done!"});
});

router.post('/like-question', function(req, res) {
    const id = req.user._id;
    console.log(req.user);
    res.send({status: "success", information: "done!"});
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

const getInterestPathFromUser = user => {
    const userType = user.type;
    let returnPath = "";
    switch (userType) {
        case "local":
            returnPath = "local"
            break;
        case "facebook":
            returnPath = "facebook"
            break;
        case "twitter":
            returnPath = "twitter"
            break;
        case "linkedin":
            returnPath = "linkedin"
            break;
        case "google":
            returnPath = "google"
            break;
        default:
            throw new Error("Failed on get login user type for getting user interest");
    }
    return returnPath;
}
