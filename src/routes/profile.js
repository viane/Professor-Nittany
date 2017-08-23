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
import path from 'path';
import config from '../config';
import watson from 'watson-developer-cloud';
import wordToText from '../system/utility/word-file-to-text';
import del from 'del';
import stringChecking from '../system/utility/string';
import fs from 'fs';

const document_conversion = watson.document_conversion({username: config.watson.document_conversion.username, password: config.watson.document_conversion.password, version: config.watson.document_conversion.version, version_date: config.watson.document_conversion.version_date});

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
  console.log(req.body);
  User.findById(req.decoded._id).exec().then((updateRecord, err) => {
    if (err) {
      console.error(err);
      return res.status(400).json(err);
    } else {
      // if user has created interest-manual before
      if (updateRecord.interest_manual && updateRecord.interest_manual != null) {
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
          // tempInterestAry = ['term1','term2',...]
          let boolInterestValid = true;
          for (let i = 0; i < tempInterestAry.length; i++) {
            if (tempInterestAry[i].length < 2) {
              boolInterestValid = false;
              break;
            }
          }
          if (!boolInterestValid) {
            return res.status(200).json({
              message: "Minimal interest length is 2",
              error: {
                name: "ContentError",
                message: "Minimal interest length is 2",
                "code": 205
              }
            });
          } else {
            const interestAry = tempInterestAry.map((interest) => {
              return {'term': interest.toString().trim(), value: maxScore}
            })
            record.interest = interestAry;
            record.save().then(() => {
              return res.status(200).json({status: "success", message: "Done updating"});
            }).catch(err => {
              return res.status(400).json(err);
            })
          }
        }).catch(err => {
          return res.status(400).json(err);
        })
      } else {
        const interestM = new manualInterest();
        req.body.interest_manual = arrayUtility.arrayUnique(req.body.interest_manual);
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
            return res.status(200).json({status: "success", message: "Done updating"});
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
  const introduction = req.body.introduction;
  profileUtility.updateUserSelfDescription(req.decoded._id, introduction).then((newAssessment) => {
    // if user description is longer than 100 words, update persoanlity assessment and analysis
    if (string.countWords(introduction) > 100) {
      // update assessment and analysis
      profileUtility.getAndUpdatePersonalityAssessment(newAssessment._id, introduction).then(() => {
        // update interest
        naturalLanguageUnderstanding.getAnalysis(introduction).then((analysis) => {
          profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
            res.status(200).json({status: "success", message: "Done updating"})
          }).catch((err) => {
            console.error(err);
            res.status(302).json(err)
          })
        }).catch((err) => {
          console.error(err);
          res.status(200).json({status: "success", message: "Done with warning", "warning": err})
        });
      }).catch((err) => {
        console.error(err);
        res.status(200).json({status: "success", message: "Done with warning", "warning": err})
      });
    } else {
      // if less than 100 words, only update user description content to DB
      newAssessment.description_content = introduction;
      newAssessment.save().then((record) => {
        User.update({
          _id: req.decoded._id
        }, {
          $set: {
            'personality_evaluation': newAssessment._id
          }
        }).exec().then(() => {
          // update interest
          naturalLanguageUnderstanding.getAnalysis(introduction, 3, 3, 3).then((analysis) => {
            profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
              res.status(200).json({status: "success", message: "Done updating"})
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
});

profileRouter.post('/update-introduction-by-file', Verify.verifyOrdinaryUser, function(req,res,next){
  console.log(req.files);

  if(req.files){
    let file = req.files.introduction;
    let file_name = req.files.introduction.name;
    if (path.extname(file_name) != ".txt") {
        return res.status(205).json({
          "message": "Invalid file type! Upload file must be in .txt",
          "error": {
            "name": "FileError",
            "message": "Invalid file type! Upload file must be in .txt",
            "code": 205
          }
        })
    }
    let data=req.files.introduction.data;
    profileUtility.updateUserSelfDescription(req.decoded._id, data).then((newAssessment) => {
      const introduction = data.toString();
      // if user description is longer than 100 words, update persoanlity assessment and analysis
      if (string.countWords(introduction) > 100) {
        // update assessment and analysis
        profileUtility.getAndUpdatePersonalityAssessment(newAssessment._id, introduction).then(() => {
          // update interest
          naturalLanguageUnderstanding.getAnalysis(introduction).then((analysis) => {
            profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
              res.status(200).json({status: "success", message: "Done updating"})
            }).catch((err) => {
              console.error(err);
              res.status(302).json(err)
            })
          }).catch((err) => {
            console.error(err);
            res.status(200).json({status: "success", message: "Done with warning", "warning": err})
          });
        }).catch((err) => {
          console.error(err);
          res.status(200).json({status: "success", message: "Done with warning", "warning": err})
        });
      } else {
        // if less than 100 words, only update user description content to DB
        newAssessment.description_content = introduction;
        newAssessment.save().then((record) => {
          User.update({
            _id: req.decoded._id
          }, {
            $set: {
              'personality_evaluation': newAssessment._id
            }
          }).exec().then(() => {
            // update interest
            naturalLanguageUnderstanding.getAnalysis(introduction, 3, 3, 3).then((analysis) => {
              profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
                res.status(200).json({status: "success", message: "Done updating"})
              }).catch((err) => {
                console.error(err);
                res.status(400).json(err)
              })
            }).catch((err) => {
              console.error(err);
              res.status(400).json(err)
            });
          }).catch((err) => {
            console.error(err);
            res.status(400).json(err)
          });
        })
      }
    }).catch(function(err) {
      console.error(err);
      res.status(400).json(err);
    });
  }
  else{
    res.status(200).json({
          "message": "you did not choose any file"
    });
  }
});
// API POST /profile/update-introduction-by-file
// profileRouter.post('/update-introduction-by-file', Verify.verifyOrdinaryUser, busboy({
//   limits: {
//     fileSize: 4 * 1024 * 1024
//   }
// }), (req, res, next) => {
//   if (!req.busboy){
//     return res.status(400).json({"message": "Busboy failure",
//     "error": {
//       "name": "SystemError",
//       "message": "Busboy failure",
//       "code": 400
//     }})
//   }
//   console.log("here");
//   let fstream;
//   req.pipe(req.busboy);
//   req.busboy.on('file', (fieldname, file, filename) => {
//     if (path.extname(filename) != ".txt" && path.extname(filename) != ".doc" && path.extname(filename) != ".docx") {
//         res.status(205).json({
//           "message": "Invalid file type! Upload file can be in either .txt, .doc or .docx",
//           "error": {
//             "name": "FileError",
//             "message": "Invalid file type! Upload file can be in either .txt, .doc or .docx",
//             "code": 205
//           }
//         })
//     }
//     if (path.extname(filename) === ".txt") {
//       file.on('data', function(data) {
//         profileUtility.updateUserSelfDescription(req.decoded._id, data).then((newAssessment) => {
//           const introduction = data.toString();
//           // if user description is longer than 100 words, update persoanlity assessment and analysis
//           if (string.countWords(introduction) > 100) {
//             // update assessment and analysis
//             profileUtility.getAndUpdatePersonalityAssessment(newAssessment._id, introduction).then(() => {
//               // update interest
//               naturalLanguageUnderstanding.getAnalysis(introduction).then((analysis) => {
//                 profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
//                   res.status(200).json({status: "success", message: "Done updating"})
//                 }).catch((err) => {
//                   console.error(err);
//                   res.status(302).json(err)
//                 })
//               }).catch((err) => {
//                 console.error(err);
//                 res.status(200).json({status: "success", message: "Done with warning", "warning": err})
//               });
//             }).catch((err) => {
//               console.error(err);
//               res.status(200).json({status: "success", message: "Done with warning", "warning": err})
//             });
//           } else {
//             // if less than 100 words, only update user description content to DB
//             newAssessment.description_content = introduction;
//             newAssessment.save().then((record) => {
//               User.update({
//                 _id: req.decoded._id
//               }, {
//                 $set: {
//                   'personality_evaluation': newAssessment._id
//                 }
//               }).exec().then(() => {
//                 // update interest
//                 naturalLanguageUnderstanding.getAnalysis(introduction, 3, 3, 3).then((analysis) => {
//                   profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
//                     res.status(200).json({status: "success", message: "Done updating"})
//                   }).catch((err) => {
//                     console.error(err);
//                     res.status(400).json(err)
//                   })
//                 }).catch((err) => {
//                   console.error(err);
//                   res.status(400).json(err)
//                 });
//               }).catch((err) => {
//                 console.error(err);
//                 res.status(400).json(err)
//               });
//             })
//           }
//         }).catch(function(err) {
//           console.error(err);
//           res.status(400).json(err);
//         });
//       });
//     } else if (path.extname(filename) === ".doc" || path.extname(filename) === ".docx") {
//       // if user upload a word file, write to temp folder and named by it's id, then parse and upload to DB
//       const filePath = path.resolve(__dirname, '../system/word-file-temp-folder/' + req.decoded._id + path.extname(filename));

//       fstream = fs.createWriteStream(filePath);
//       // write file to temp folder
//       file.pipe(fstream);

//       fstream.on('close', function() {
//         // using watson documention conversion

//         document_conversion.convert({
//           file: fs.createReadStream(filePath),
//           conversion_target: document_conversion.conversion_target.ANSWER_UNITS,
//           word: config.watson.document_conversion.config
//         }, (err, response) => {
//           if (err) {
//             res.status(400).json(err);
//           } else {
//             const fullDoc = wordToText.combineResult(response);
//             profileUtility.updateUserSelfDescription(req.decoded._id, fullDoc).then((newAssessment) => {
//               // done write to DB, delete file
//               del([filePath]).then().catch((err) => {
//                 console.error(err);
//               });
//               if (stringChecking.countWords(fullDoc) > 100) {
//                 profileUtility.getAndUpdatePersonalityAssessment(req.decoded._id, fullDoc).then(() => {
//                   // update interest
//                   naturalLanguageUnderstanding.getAnalysis(fullDoc, 20, 20, 20).then((analysis) => {
//                     profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
//                       res.status(200).json({status: "success", message: "Done updating"})
//                     }).catch((err) => {
//                       console.error(err);
//                       res.status(400).json(err)
//                     })
//                   }).catch((err) => {
//                     console.error(err);
//                     res.status(400).json(err)
//                   });
//                 }).catch((err) => {
//                   console.error(err);
//                   res.status(400).json(err)
//                 });
//               } else {
//                 // if less than 100 words, only update user description content to DB
//                 newAssessment.description_content = fullDoc;
//                 newAssessment.save().then((record) => {
//                   User.update({
//                     _id: req.decoded._id
//                   }, {
//                     $set: {
//                       'personality_evaluation': newAssessment._id
//                     }
//                   }).exec().then(() => {
//                     // update interest
//                     naturalLanguageUnderstanding.getAnalysis(fullDoc, 3, 3, 3).then((analysis) => {
//                       profileUtility.updateInterest(req.decoded._id, analysis).then(() => {
//                         res.status(200).json({status: "success", message: "Done updating"})
//                       }).catch((err) => {
//                         console.error(err);
//                         res.status(400).json(err)
//                       })
//                     }).catch((err) => {
//                       console.error(err);
//                       res.status(400).json(err)
//                     });
//                   }).catch((err) => {
//                     console.error(err);
//                     res.status(400).json(err)
//                   });
//                 })
//               }
//             }).catch(function(err) {
//               // if error on write to DB, leave the file in the folder for further examnaton
//               console.error(err);
//               res.status(400).json(err)
//             });
//           }
//         });

//       });
//     }
//   });
// })

profileRouter.get('/introduction', Verify.verifyOrdinaryUser, (req,res)=>{
  User.findById(req.decoded._id,(err,record)=>{
    if (err) {
      res.status(400),json(err);
    }
    PersonalityAssessment.findById(record.personality_evaluation,(err,record)=>{
      if (err) {
        res.status(400),json(err);
      }
      res.status(200).json({introduction:record.description_content});
    })
  })
})

profileRouter.get('/personality-assessement', Verify.verifyOrdinaryUser, (req,res)=>{
  User.findById(req.decoded._id,(err,record)=>{
    if (err) {
      res.status(400),json(err);
    }
    PersonalityAssessment.findById(record.personality_evaluation,(err,record)=>{
      if (err) {
        res.status(400),json(err);
      }
      record.description_content = undefined;
      delete record.description_content;
      res.status(200).json(record);
    })
  })
})

module.exports = profileRouter;
