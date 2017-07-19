// ../app/profile.js

'use strict'
const personality = require('./personality-insights');
const User = require('./models/user');
const arrayUtility = require('./utility-function/array');

const updateInterest = (user, analysis) => {
    // each part of analysis is in {text, realvence} json format
    User.findById(user.id, (err, foundUser) => {
        if (err) {
            console.error(err);
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

            User.findOneAndUpdate({
                "_id": user.id
            }, {
                "$set": {
                    "interest": foundUser.interest
                }
            }, {
                "new": true
            }, (err, update) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    });
};
module.exports.updateInterest = updateInterest;

const updateUserSelfDescription = (user, description) => {
    const id = user._id;
    return new Promise((resolve, reject) => {
        User.update({
            _id: id
        }, {
            $set: {
                personality_assessement: {
                    last_upload_time: new Date().toISOString(),
                    description_content: description.toString('utf8'),
                    evaluation: {}
                }
            }
        }).exec().then((query_report) => {
            resolve(query_report);
        }).catch((err) => {
            throw err
            reject(err);
        });
    });
}

module.exports.updateUserSelfDescription = updateUserSelfDescription;
const updateUserPersonalityAssessment = (user, assessment) => {
    const id = user._id;
    return new Promise((resolve, reject) => {
        User.update({
            _id: id
        }, {
            "$set": {
                'personality_assessement.evaluation': assessment
            }
        }).exec().then((query_report) => {
            resolve(query_report);
        }).catch((err) => {
            throw err
            reject(err);
        });
    });

}

module.exports.updateUserPersonalityAssessment = updateUserPersonalityAssessment;

// after updateUserSelfDescription is called
const getAndUpdatePersonalityAssessment = (user, description) => {
    return new Promise((resolve, reject) => {
        personality.getAnalysis(description).then(assessment => updateUserPersonalityAssessment(user, assessment).then(resolve()).catch(err => {
            console.error(err);
            reject(err);
        }));
    });

}

module.exports.getAndUpdatePersonalityAssessment = getAndUpdatePersonalityAssessment;

const getUserRecordPathByAccountType = user => {
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

module.exports.getUserRecordPathByAccountType = getUserRecordPathByAccountType;
