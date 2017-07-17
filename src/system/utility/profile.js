'use strict';
const User = require('../../models/user');
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
        // update interest array
        // addup realvence if term exist, else push to array
        analysis.keywords.map((keyword) => {
          const trueIndex = arrayUtility.findIndexByKeyValue(foundUser.interest, 'term', keyword.text);
          if (trueIndex != null) {
            foundUser.interest[trueIndex].value += keyword.relevance;
          } else {
            foundUser.interest.unshift({term: keyword.text, value: keyword.relevance});
          }
        });
        analysis.entities.map((entity) => {
          const trueIndex = arrayUtility.findIndexByKeyValue(foundUser.interest, 'term', entity.text);
          if (trueIndex != null) {
            foundUser.interest[trueIndex].value += entity.relevance;
          } else {
            foundUser.interest.unshift({term: entity.text, value: entity.relevance});
          }
        });
        analysis.concepts.map((concept) => {
          const trueIndex = arrayUtility.findIndexByKeyValue(foundUser.interest, 'term', concept.text);
          if (trueIndex != null) {
            foundUser.interest[trueIndex].value += concept.relevance;
          } else {
            foundUser.interest.unshift({term: concept.text, value: concept.relevance});
          }
        });

        foundUser.save().then((newProfile) => {
          resolve(newProfile)
        }).catch((err) => {
          console.error(err);
          reject(err)
        })
      }
    });
  });
};
