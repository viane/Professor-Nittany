const express = require('express');
const profileRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Verify = require('./verify');
const User = require('../models/user');
import arrayUtility from '../system/utility/array';
import string from '../system/utility/string';
const PersonalityAssessment = require('../models/personality-assessement');
import profileUtility from '../system/utility/profile';
import naturalLanguageUnderstanding from '../system/watson/natural-language-understanding';

profileRouter.use(bodyParser.json());

// API GET /profile/interest-manual
profileRouter.get('/interest-manual', Verify.verifyOrdinaryUser, (req, res) => {
  User.findById(req.decoded._id).exec().then((updateRecord, err) => {
    res.status(200).json({
      interest: [updateRecord.interest_manual]
    });
  }).catch((err) => {
    console.error(err);
    res.status(302).json(err);
  });
});

// API POST /profile/interest-manual {"interest_manual":["CS","CE"]}
profileRouter.post('/interest-manual', Verify.verifyOrdinaryUser, (req, res) => {
  User.findById(req.decoded._id).exec().then((updateRecord, err) => {
    if (err) {
      console.error(err);
      res.status(302).json(err);
    } else {
      // manual add current user max weight from AI recognized interest to the interest that user input by hand
      let maxScore = 1.0;
      for (let i = 0; i < updateRecord.interest.length; i++) {
        if (maxScore < updateRecord.interest[i].value) {
          maxScore = updateRecord.interest[i].value;
        }
      }
      // form manual interest array has no duplicates with max weight
      const interestAry = arrayUtility.arrayUnique(req.body.interest_manual.map((interest) => {
        if (interest.length < 2) {
          return res.status(200).json({error: "Minimal interest length is 2"});
        };
        return {'term': interest.toString().trim(), value: maxScore}
      }));
      updateRecord.interest_manual = interestAry;
      updateRecord.save((err, user) => {
        if (err) {
          console.error(err);
          return res.status(302).json(err);
        }
        res.status(200).json({message: "Done updating"});
      })
    }
  }).catch((err) => {
    console.error(err);
    res.status(302).json(err);
  });
});

// API POST /profile/update-introduction
profileRouter.post('/update-introduction', Verify.verifyOrdinaryUser, (req, res) => {
  const introdcution = req.body.introdcution;
  profileUtility.updateUserSelfDescription(req.decoded._id, introdcution).then((newAssessment) => {
    // if user description is longer than 100 words, update persoanlity assessment and analysis
    if (string.countWords(introdcution) > 100) {
      // update assessment and analysis
      profileUtility.getAndUpdatePersonalityAssessment(newAssessment._id, introdcution).then(() => {
        // update interest
        naturalLanguageUnderstanding.getAnalysis(introdcution).then((analysis) => {
          profileUtility.updateInterest(req.decoded._id, analysis).then((newProfile) => {
            res.status(200).json({message:"Done","update-profile": newProfile})
          }).catch((err) => {
            console.error(err);
            res.status(302).json(err)
          })
        }).catch((err) => {
          console.error(err);
          res.status(200).json({message:"Done with warning","warning":err})
        });
      }).catch((err) => {
        console.error(err);
        res.status(200).json({message:"Done with warning","warning":err})
      });
    } else {
      // if less than 100 words, only update user description content to DB
      const assessment = new PersonalityAssessment();
      assessment.description_content = introdcution;
      assessment.save().then((newAssessment) => {
        User.update({
          _id: req.decoded._id
        }, {
          $set: {
            'personality_evaluation': newAssessment._id
          }
        }).exec().then(() => {
          // update interest
          naturalLanguageUnderstanding.getAnalysis(introdcution, 20, 20, 20).then((analysis) => {
            profileUtility.updateInterest(req.decoded._id, analysis).then((newProfile) => {
              res.status(200).json({"update-profile": newProfile})
            }).catch((err) => {
              console.error(err);
              res.status(302).json(err)
            })
          }).catch((err) => {
            console.error(err);
            res.status(302).json(err)
          });
        }).catch((err) => {
          console.error(err);
          res.status(302).json(err)
        });
      })
    }
  }).catch(function(err) {
    console.error(err);
    res.status(302).json(err)
  })
})

module.exports = profileRouter;
