const express = require('express');
const profileRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Verify = require('../system/utility/verify');
const User = require('../models/user');
import arrayUtility from '../system/utility/array';
import string from '../system/utility/string';
const PersonalityAssessment = require('../models/personality-assessement');
import profileUtility from '../system/utility/profile';
import naturalLanguageUnderstanding from '../system/watson/natural-language-understanding';
import busboy from 'connect-busboy';
import manualInterest from '../models/interest-manual';

profileRouter.use(bodyParser.json());

// API GET /profile/interest-manual
profileRouter.get('/interest-manual', Verify.verifyOrdinaryUser, (req, res) => {
  User.findById(req.decoded._id).exec().then((updateRecord, err) => {
    manualInterest.findById(updateRecord.interest_manual).exec().then((record, err) => {
      if (err) {
        return res.status(400).json(err);
      }
      res.status(200).json({"interest-manual": record});
    })
  }).catch((err) => {
    console.error(err);
    res.status(400).json(err);
  });
});

// API POST /profile/interest-manual {"interest_manual":["CS","CE"]}
profileRouter.post('/interest-manual', Verify.verifyOrdinaryUser, (req, res) => {
  User.findById(req.decoded._id).exec().then((updateRecord, err) => {
    if (err) {
      console.error(err);
      return res.status(400).json(err);
    } else {
      // if user has created interest-manual before
      if (updateRecord.interest_manual) {
        // find interest-manual record
        manualInterest.findById(updateRecord.interest_manual).exec().then((record, err) => {
          // manual add current user max weight from AI recognized interest to the interest that user input by hand
          let maxScore = 1.0;
          for (let i = 0; i < record.interest.length; i++) {
            if (maxScore < record.interest[i].value) {
              maxScore = record.interest[i].value;
            }
          }
          // form manual interest array has no duplicates with max weight

          let tempInterestAry = req.body.interest_manual.concat(record.interest.map(interest => {
            return interest.term;
          }))
          tempInterestAry = arrayUtility.arrayUnique(tempInterestAry);
          console.log(tempInterestAry);
          // tempInterestAry = ['term1','term2',...]
          const interestAry = tempInterestAry.map((interest) => {
            if (interest.length < 2) {
              return res.status(200).json({error: "Minimal interest length is 2"});
            };
            return {'term': interest.toString().trim(), value: maxScore}
          })
          console.log(interestAry);
          record.interest = interestAry;
          record.save().then(() => {
            res.status(200).json({message: "Done updating"});
          })
        }).catch(err => {
          return res.status(400).json(err);
        })
      } else {
        const interestM = new manualInterest();
        interestM.interest = req.body.interest_manual.map(interest => {
          return {"term": interest, "value": 1}
        })
        interestM.save().then(record => {
          updateRecord.interest_manual = record._id;
          updateRecord.save((err, user) => {
            if (err) {
              console.error(err);
              return res.status(400).json(err);
            }
            return res.status(200).json({message: "Done updating"});
          })
        }).catch(err => {
          return res.status(400).json(err);
        })
      }
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
            res.status(200).json({message: "Done", "update-profile": newProfile})
          }).catch((err) => {
            console.error(err);
            res.status(302).json(err)
          })
        }).catch((err) => {
          console.error(err);
          res.status(200).json({message: "Done with warning", "warning": err})
        });
      }).catch((err) => {
        console.error(err);
        res.status(200).json({message: "Done with warning", "warning": err})
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

// API POST /profile/upload-description-text-file
profileRouter.post('/upload-description-text-file', busboy({
  limits: {
    fileSize: 4 * 1024 * 1024
  }
}), (req, res, next) => {
  if (!req.busboy)
    return next('route');

  let fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', (fieldname, file, filename) => {
    if (path.extname(filename) === ".txt") {
      file.on('data', function(data) {
        profile.updateUserSelfDescription(req.user, data).then((query_report) => {
          const dataText = data.toString();
          // if user description is longer than 100 words, update persoanlity assessment and analysis
          if (stringChecking.countWords(dataText) > 100) {
            // update assessment and analysis
            profile.getAndUpdatePersonalityAssessment(req.user, dataText).then(() => {
              // update interest
              naturalLanguageUnderstanding.getAnalysis(dataText, 20, 20, 20).then((analysis) => {
                profile.updateInterest(req.user, analysis);
              }).catch((err) => {
                console.error(err);
              });
              res.sendStatus(200);
            }).catch((err) => {
              console.error(err);
              res.sendStatus(500);
            });
          } else {
            // if less than 100 words, only update user description content to DB
            User.update({
              _id: req.user._id
            }, {
              $set: {
                'personality_assessement.description_content': dataText,
                'personality_assessement.evaluation': {}
              }
            }).exec().then(() => {
              // update interest
              naturalLanguageUnderstanding.getAnalysis(dataText, 20, 20, 20).then((analysis) => {
                profile.updateInterest(req.user, analysis);
              }).catch((err) => {
                console.error(err);
              });
              res.sendStatus(200);
            }).catch((err) => {
              console.error(err);
              res.sendStatus(300);
            });
          }
        }).catch(function(err) {
          console.error(err);
          res.sendStatus(300);
        });

      });
    } else if (path.extname(filename) === ".doc" || path.extname(filename) === ".docx") {
      // if user upload a word file, write to temp folder and named by it's id, then parse and upload to DB
      const filePath = appRoot + '/app/word-file-temp-folder/' + req.user.id + path.extname(filename);
      fstream = fs.createWriteStream(filePath);
      // write file to temp folder
      file.pipe(fstream);
      fstream.on('close', function() {
        loadJsonFile(appRoot + '/config/api-configuration.json').then(json => {
          // using watson documention conversion
          document_conversion.convert({
            file: fs.createReadStream(filePath),
            conversion_target: document_conversion.conversion_target.ANSWER_UNITS,
            word: json.document_conversion_config
          }, (err, response) => {
            if (err) {
              console.error(err);
              res.sendStatus(300);
            } else {

              const fullDoc = wordToText.combineResult(response);

              profile.updateUserSelfDescription(req.user, fullDoc).then(() => {
                // done write to DB, delete file
                del.promise([filePath]).then(() => {}).catch((err) => {
                  throw err;
                });
                if (stringChecking.countWords(fullDoc) > 100) {
                  profile.getAndUpdatePersonalityAssessment(req.user, fullDoc).then(() => {
                    // update interest
                    naturalLanguageUnderstanding.getAnalysis(fullDoc, 20, 20, 20).then((analysis) => {
                      profile.updateInterest(req.user, analysis);
                    }).catch((err) => {
                      console.error(err);
                    });
                    res.sendStatus(200);
                  }).catch((err) => {
                    console.error(err);
                    res.sendStatus(300);
                  });
                } else {
                  User.update({
                    _id: req.user._id
                  }, {
                    $set: {
                      'personality_assessement.description_content': fullDoc,
                      'personality_assessement.evaluation': {}
                    }
                  }).exec().then(() => {
                    naturalLanguageUnderstanding.getAnalysis(fullDoc, 20, 20, 20).then((analysis) => {
                      profile.updateInterest(req.user, analysis);
                    }).catch((err) => {
                      console.error(err);
                    });
                    res.sendStatus(200);
                  }).catch((err) => {
                    console.error(err);
                    res.sendStatus(300);
                  });
                }

              }).catch(function(err) {
                // if error on write to DB, leave the file in the folder for further examnaton
                throw err;
                res.sendStatus(300);
              });
              // personality analysis only takes input that is more than 100 words

            }
          });
        });
      });

    }
  });
})

module.exports = profileRouter;
