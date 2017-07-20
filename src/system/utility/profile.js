'use strict';
const User = require('../../models/user');
import Interest from '../../models/interest';
const PersonalityAssessment = require('../../models/personality-assessement');
import PersonalityInsightsV3 from '../watson/personality-insights';
import arrayUtility from './array';

module.exports.updateUserSelfDescription = (userID, description) => {
  const id = userID;
  return new Promise((resolve, reject) => {
    const assessment = new PersonalityAssessment();
    assessment.description_content = description;
    assessment.save().then((newAssessment) => {
      User.update({
        _id: id
      }, {
        $set: {
          personality_evaluation: newAssessment._id
        }
      }).exec().then(() => {
        resolve(newAssessment);
      }).catch((err) => {
        console.error(err);
        reject(err);
      });
    }).catch((err) => {
      console.error(err);
      reject(err);
    })

  });
}

module.exports.getAndUpdatePersonalityAssessment = (assessmentID, description) => {
  return new Promise((resolve, reject) => {
    PersonalityInsightsV3.getAnalysis(description).then(assessment => updateUserPersonalityAssessment(assessmentID, assessment).then(resolve()).catch(err => {
      console.error(err);
      reject(err);
    })).catch(err => {
      console.error(err);
      reject(err);
    });
  });

}

const updateUserPersonalityAssessment = (assessmentID, assessment) => {
  const id = assessmentID;
  return new Promise((resolve, reject) => {
    PersonalityAssessment.update({
      _id: id
    }, {
      "$set": {
        'evaluation': assessment
      }
    }).exec().then((query_report) => {
      resolve(query_report);
    }).catch((err) => {
      console.error(err);
      reject(err);
    });
  });

}
module.exports.updateUserPersonalityAssessment = updateUserPersonalityAssessment;

module.exports.updateInterest = (userID, analysis) => {
  return new Promise(function(resolve, reject) {
    // each part of analysis is in {text, realvence} json format
    User.findById(userID, (err, foundUser) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // if first time create interest
        if (!foundUser.interest || foundUser.interest === null) {
          // create interest, fills content, assign ID to foundUser.interest
          const interest = new Interest();
          // addup realvence if term exist, else push to array
          analysis.keywords.map((keyword) => {
            interest.interest.unshift({term: keyword.text, value: keyword.relevance});
          });
          analysis.entities.map((entity) => {
            interest.interest.unshift({term: entity.text, value: entity.relevance});
          });
          analysis.concepts.map((concept) => {
            interest.interest.unshift({term: concept.text, value: concept.relevance});
          })
          interest.save().then((record) => {
            foundUser.interest = record._id;
            foundUser.save().then(() => {
              resolve()
            }).catch((err) => {
              console.error(err);
              reject(err)
            })
          }).catch((err) => {
            console.error(err);
            reject(err)
          })
        } else {
          // only update interest
          Interest.findById(foundUser.interest,(err, record)=>{
            if (err) {
              console.error(err);
              reject(err);
            }
            analysis.keywords.map((keyword) => {
              const trueIndex = arrayUtility.findIndexByKeyValue(record.interest, 'term', keyword.text);
              if (trueIndex != null) {
                record.interest[trueIndex].value += keyword.relevance;
              } else {
                record.interest.unshift({term: keyword.text, value: keyword.relevance});
              }
            });
            analysis.entities.map((entity) => {
              const trueIndex = arrayUtility.findIndexByKeyValue(record.interest, 'term', entity.text);
              if (trueIndex != null) {
                record.interest[trueIndex].value += entity.relevance;
              } else {
                record.interest.unshift({term: entity.text, value: entity.relevance});
              }
            });
            analysis.concepts.map((concept) => {
              const trueIndex = arrayUtility.findIndexByKeyValue(record.interest, 'term', concept.text);
              if (trueIndex != null) {
                record.interest[trueIndex].value += concept.relevance;
              } else {
                record.interest.unshift({term: concept.text, value: concept.relevance});
              }
            })
            record.save().then(()=>{
              resolve()
            }).catch((err)=>{
              reject(err)
            })
          })

        }
      }
    })
  })
}
