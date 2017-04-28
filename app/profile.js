'use strict'

const express = require('express');
const router = express.Router();
const busboy = require('connect-busboy');
const fs = require('fs');
const appRoot = require('app-root-path');
const readFile = Promise.promisify(require("fs").readFile);
const writeFile = Promise.promisify(require("fs").writeFile);
const path = require('path');
const stream = require('stream'),
    es = require('event-stream');

const User = require(appRoot + '/app/models/user');

const del = require('delete');

const watson = require('watson-developer-cloud');

const document_conversion = watson.document_conversion({username: 'd1f406ed-2958-472b-80d6-f1f5a8f176f1', password: 'hiJHDXkxq16o', version: 'v1', version_date: '2015-12-15'});

const loadJsonFile = require('load-json-file');

const personality = require(appRoot + '/app/personality-insights');

const formidable = require('formidable');

const loginChecking = require(appRoot + '/app/utility-function/login-checking');

const wordToText = require(appRoot + '/app/utility-function/word-file-to-text');

const arrayUtility = require(appRoot + '/app/utility-function/array');

const formatter = require(appRoot + '/app/utility-function/formatter');

const naturalLanguageUnderstanding = require(appRoot + '/app/natural-language-understanding');

const frontEndRoot = appRoot + '/views/FrontEnd/';

let _io;

router.get('/get-interest-manual', (req, res) => {
    User.findById(req.user._id).exec().then((updateRecord, err) => {
        return res.send({
            interestAry: [updateRecord.interest_manual]
        });
    }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
});

router.post('/update-interest-manual', (req, res) => {
    User.findById(req.user._id).exec().then((updateRecord, err) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        // manual add current user max weight from AI recognized interest to the interest that user input by hand
        let maxScore = 1.0;
        for (let i = 0; i < updateRecord.interest.length; i++) {
            if (maxScore < updateRecord.interest[i].value) {
                maxScore = updateRecord.interest[i].value;
            }
        }
        // form manual interest array has no duplicates with max weight
        const interestAry = arrayUtility.arrayUnique(JSON.parse(req.body.interest_manual).map((interest) => {
            if (interest.length < 2) {
                return res.sendStatus(300);
            };
            return {'term': interest.toString().trim(), value: maxScore}
        }));
        updateRecord.interest_manual = interestAry;
        updateRecord.save((err, user) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        })
    }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });

});

router.post('/upload/update-introduction', (req, res) => {
    updateUserSelfDescription(req.user, req.body.introdcution).then((query_report) => {
        const dataText = req.body.introdcution;
        // if user description is longer than 100 words, update persoanlity assessment and analysis
        if (countWords(dataText) > 100) {
            // update assessment and analysis
            getAndUpdatePersonalityAssessment(req.user, dataText).then(() => {
                // update interest
                naturalLanguageUnderstanding.getAnalysis(dataText).then((analysis) => {
                    updateInterest(req.user, analysis);
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
                    updateInterest(req.user, analysis);
                }).catch((err) => {
                    console.error(err);
                });
                res.sendStatus(200);
            }).catch((err) => {
                console.error(err);
                res.sendStatus(500);
            });
        }
    }).catch(function(err) {
        console.error(err);
        res.sendStatus(300);
    });
});

router.post('/upload/upload-description-text-file', busboy({
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
                updateUserSelfDescription(req.user, data).then((query_report) => {
                    const dataText = data.toString();
                    // if user description is longer than 100 words, update persoanlity assessment and analysis
                    if (countWords(dataText) > 100) {
                        // update assessment and analysis
                        getAndUpdatePersonalityAssessment(req.user, dataText).then(() => {
                            // update interest
                            naturalLanguageUnderstanding.getAnalysis(dataText, 20, 20, 20).then((analysis) => {
                                updateInterest(req.user, analysis);
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
                                updateInterest(req.user, analysis);
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

                            updateUserSelfDescription(req.user, fullDoc).then(() => {
                                // done write to DB, delete file
                                del.promise([filePath]).then(() => {}).catch((err) => {
                                    throw err;
                                });
                                if (countWords(fullDoc) > 100) {
                                    getAndUpdatePersonalityAssessment(req.user, fullDoc).then(() => {
                                        // update interest
                                        naturalLanguageUnderstanding.getAnalysis(fullDoc, 20, 20, 20).then((analysis) => {
                                            updateInterest(req.user, analysis);
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
                                            updateInterest(req.user, analysis);
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

// Get user interests
router.get('/get-interest', (req, res) => {
    User.findById(req.user._id).exec().then((foundUser) => {
        let interestAry = [];
        foundUser.interest_manual.map((interestObj) => {
            interestAry.unshift(interestObj)
        });
        foundUser.interest.map((interestObj) => {
            interestAry.unshift(interestObj)
        })
        // format interest array
        res.send({status: "success", information: "good", interest: formatter.convertUserInterestTowordCloud(interestAry)});
    }).catch((err) => {
        throw err;
        res.send({type: 'error', information: err});
    })
});

// Get user introduction
router.get('/get-introduction', (req, res) => {
    User.findById(req.user._id).exec().then((foundUser) => {
        res.send({status: "success", information: "Successfully load introduction.", introduction: foundUser.personality_assessement.description_content});
    }).catch((err) => {
        throw err;
        res.send({type: 'error', information: err});
    })
});

// Get user personaltity assessment
router.get('/get-personalityAssessment', (req, res) => {
    User.findById(req.user._id).exec().then((foundUser) => {
        res.send({status: "success", information: "Successfully load assessment.", assessment: foundUser.personality_assessement.evaluation});
    }).catch((err) => {
        throw err;
        res.send({type: 'error', information: err});
    })
});

// Delete question from quesion history
router.post('/delete-question-history', loginChecking.isLoggedInRedirect, (req, res) => {
    User.update({
        _id: req.user._id
    }, {
        $pull: {
            ask_history: {
                'question_body': req.body.question_body
            }
        }
    }).exec().then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
});

// unfav question from question history
router.post('/unfav-question-history', loginChecking.isLoggedInRedirect, (req, res) => {
    User.update({
        _id: req.user._id,
        'ask_history.question_body': req.body.question_body
    }, {
        '$set': {
            'ask_history.$.favorite': false
        }
    }).exec().then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
});

// fav question with answer pair from main page
router.post('/fav-question-answer', loginChecking.isLoggedInRedirect, (req, res) => {
    User.update({
        _id: req.user._id,
        'ask_history.question_body': req.body.question_body
    }, {
        '$set': {
            'ask_history.$.favorite': true,
            'ask_history.$.answer_body': req.body.answer
        }
    }).exec().then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
});

// Post user avatar
router.post('/update-avatar', loginChecking.isLoggedInRedirect, (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = appRoot + '/views/FrontEnd/avatar/';

    form.maxFieldsSize = 1024 * 1024;

    form.parse(req, (err, fields, files) => {

        const file = files.file;

        // Only jpeg, png, jpg are allowed

        if (file.type != "image/jpeg" && file.type != "image/png" && file.type != "image/jpg") {
            res.send({type: 'error', information: "Unexcepted image type"});
            del.promise([file.path]).then(function() {}).catch((err) => {
                throw err;
            });
        } else {
            let ext = "";
            switch (file.type) {
                case "image/jpeg":
                    ext = ".jpeg"
                    break;
                case "image/png":
                    ext = ".png"
                    break;
                case "image/jpg":
                    ext = ".jpg"
                    break;
            }
            const newPath = form.uploadDir + req.user.id + ext;
            fs.rename(file.path, newPath, (err) => {
                if (err) {
                    throw err;
                    res.send({type: 'error', information: err});
                } else {
                    const updatePath = "/avatar/" + req.user.id + ext;
                    User.findOneAndUpdate({
                        '_id': req.user.id
                    }, {
                        "local.avatar": updatePath
                    }, {new: true}).exec().then((foundUser) => {
                        if (!foundUser || foundUser.type != "local") {
                            res.send({type: 'error', information: "Unknow failure"})
                            throw new Error("User updating avatar with suspicious user type");
                        } else {
                            res.send({type: 'success', information: "Success upload avatar", avatarPath: updatePath});
                        }
                    }).catch((err) => {
                        throw err;
                        res.send({type: 'error', information: err});
                    })
                }
            });

        }

    });
});

// user generate assessment and send to advisor(s)
router.post('/send-assessment', (req, res) => {
    User.findById(req.user._id, (err, foundStudent) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            const viewSection = JSON.parse(req.body.advisor).viewSection;
            const viewAdvisor = JSON.parse(req.body.advisor).receiveAdvisor;
            if (viewSection.length < 1 || viewAdvisor.length < 1) {
                return res.send({error: "You must select at least one of the section and advisor to be viewed for your assessment."});
            }

            let assessment = {
                view_section: viewSection,
                reviewer: viewAdvisor,
                user_viewed_before_change:true,
                owner_display_name: foundStudent[foundStudent['type']].displayName,
                comment_summary: []
            }

            if (viewSection.includes('question')) {
                assessment.question = foundStudent.ask_history,
                assessment.question_comment = []
            }

            if (viewSection.includes('personality')) {
                assessment.personality_evaluation = foundStudent.personality_assessement.evaluation,
                assessment.personality_evaluation_comment = []
            }

            if (viewSection.includes('interest')) {
                assessment.interest = {
                    system_detect: foundStudent.interest,
                    manual_input: foundStudent.interest_manual
                }
                assessment.interest_comment = []
            }

            if (viewSection.includes('introduction')) {
                assessment.introduction = foundStudent.personality_assessement.description_content,
                assessment.introduction_comment = []
            }

            foundStudent.submitted_assessment_history.unshift(assessment);
            foundStudent.save((err, updateStudent) => {
                if (err) {
                    console.error(err);
                    return res.sendStatus(500);
                }

                // find advisor(s) id, send to assessment id to each to them's received_assessment_history with this assessment's id

                const advisorReceiveAssessmentOBJ = {
                    assessment_type: "student_assessment",
                    from_user_id: updateStudent.id,
                    assessment_id: updateStudent.submitted_assessment_history[0].id
                }

                // push assessment obj to user inbox
                updateStudent.inbox.unshift(advisorReceiveAssessmentOBJ);
                updateStudent.save()

                // push assessment obj to each advisor's received_assessment_history and inbox
                viewAdvisor.map((advisor, index) => {
                    User.findById(advisor.id, (err, foundAdvisor) => {
                        if (err) {
                            console.error(err);
                            res.sendStatus(500);
                        }
                        foundAdvisor.received_assessment_history.unshift(advisorReceiveAssessmentOBJ);
                        foundAdvisor.inbox.unshift(advisorReceiveAssessmentOBJ);
                        foundAdvisor.save((err, updateAdvisor) => {
                            if (err) {
                                console.error(err);
                                res.sendStatus(500);
                            }
                            if (!err && index + 1 === viewAdvisor.length) {
                                res.sendStatus(200);
                            }
                        });
                    })
                })

            })

        };

    });
});

router.get('/get-last-assessment', (req, res) => {
    User.findById(req.user._id, (err, foundUser) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            const index = foundUser.submitted_assessment_history.length - 1;
            res.send({assessment: foundUser.submitted_assessment_history[index]});
        }
    })
});

router.get('/get-inbox-assessment', (req, res) => {
    User.findById(req.user._id, (err, foundRequestUser) => {
        if (err) {
            console.error(err);
            res.sendStatus(500);
        } else {
            let assessments = [];
            const parseAssessment = () => {
                return new Promise(function(resolve, reject) {
                    const assessmentsReference = foundRequestUser.inbox;
                    if (foundRequestUser.inbox.length === 0) {
                       return res.send({inbox_assessment: []});
                    }
                    assessmentsReference.map((inboxItem, index) => {
                        if (inboxItem.assessment_type === "student_assessment") {
                            const assessmentHolderID = inboxItem.from_user_id;
                            const assessmentID = inboxItem.assessment_id;
                            User.findById(assessmentHolderID, (err, foundAssessmentHolder) => {
                                if (err) {
                                    console.error(err);
                                    res.sendStatus(500);
                                } else {
                                    const assessmentIndex = arrayUtility.findIndexByKeyValue(foundAssessmentHolder.submitted_assessment_history, "id", assessmentID);
                                    if (assessmentIndex != null) {
                                        const assessmentObj = foundAssessmentHolder.submitted_assessment_history[assessmentIndex];
                                        if (foundRequestUser[foundRequestUser["type"]].role === "student") {
                                            assessmentObj.owner_display_name = undefined;
                                        }
                                        assessments.unshift(assessmentObj);
                                        if (index + 1 == foundAssessmentHolder.inbox.length) {
                                            resolve();
                                        }
                                    }
                                }
                            })
                        }
                    });
                });
            };
            parseAssessment().then(() => {
                res.send({inbox_assessment: assessments});
            });
        }
    })
});

router.get('/get-assessment/:assessmentID', (req, res) => {
    const assessmentID = req.params.assessmentID;
    const requestUserID = req.user._id;
    User.findById(requestUserID, (err, foundRequestUser) => {
        if (err) {
            console.error(err);
            return res.render(frontEndRoot + 'error/error.ejs', {
                user: req.user,
                error: 500,
                type: 'Error on DB connection.',
                message: 'Please try again later, or contact us.'
            });
        }
        // request made by advisor
        if (foundRequestUser[foundRequestUser['type']].role === 'advisor') {
            const referenceAssessmentInboxIndex = arrayUtility.findIndexByKeyValue(foundRequestUser.inbox, 'assessment_id', assessmentID);
            if (referenceAssessmentInboxIndex != null) {
                const assessmentHolderID = foundRequestUser.inbox[referenceAssessmentInboxIndex].from_user_id;
                User.findById(assessmentHolderID, (err, foundAssessmentHolder) => {
                    if (err) {
                        console.error(err);
                        return res.render(frontEndRoot + 'error/error.ejs', {
                            user: req.user,
                            error: 500,
                            type: 'Error on DB connection.',
                            message: 'Please try again later, or contact us.'
                        });
                    }
                    const assessmentIndex = arrayUtility.findIndexByKeyValue(foundAssessmentHolder.submitted_assessment_history, 'id', assessmentID);
                    if (assessmentIndex != null) {
                        return res.render(frontEndRoot + 'assessment-report.ejs', {assessment: foundAssessmentHolder.submitted_assessment_history[assessmentIndex], user:req.user});
                    }
                    return res.render(frontEndRoot + 'error/error.ejs', {
                        user: req.user,
                        error: 404,
                        type: 'Error searching assessment.',
                        message: 'Assessment does not exist.'
                    });
                });
            } else {
                return res.render(frontEndRoot + 'error/error.ejs', {
                    user: req.user,
                    error: 404,
                    type: 'Error reference assessment.',
                    message: 'This assessment has some issues.'
                });
            }
        } else if (foundRequestUser[foundRequestUser['type']].role === 'student') {
            // request made by student
            User.findById(requestUserID, (err, foundAssessmentHolder) => {
                if (err) {
                    console.error(err);
                    return res.render(frontEndRoot + 'error/error.ejs', {
                        user: req.user,
                        error: 500,
                        type: 'Error on DB connection.',
                        message: 'Please try again later, or contact us.'
                    });
                }
                const assessmentIndex = arrayUtility.findIndexByKeyValue(foundAssessmentHolder.submitted_assessment_history, 'id', assessmentID);
                if (assessmentIndex != null) {
                    return res.send({assessment: foundAssessmentHolder.submitted_assessment_history[assessmentIndex]});
                }
                return res.render(frontEndRoot + 'error/error.ejs', {
                    user: req.user,
                    error: 404,
                    type: 'Error searching assessment.',
                    message: 'Assessment does not exist.'
                });
            })
        } else {
            // request user is either advisor or student
            return res.render(frontEndRoot + 'error/error.ejs', {
                user: req.user,
                error: 403,
                type: 'Forbidden premission.',
                message: 'Unindentified user type.'
            });
        }
    })
});

router.get('/delete-assessment', (req, res) => {
    const assessmentID = req.assessmentID;
    const requestUserID = req.user._id;
    User.findById(requestUserID, (err, foundRequestUser) => {
        if (err) {
            console.error(err);
            return res.render(frontEndRoot + 'error/error.ejs', {
                user: req.user,
                error: 500,
                type: 'Error on DB connection.',
                message: 'Please try again later, or contact us.'
            });
        }
        // request made by advisor
        if (foundRequestUser[foundRequestUser['type']].role === 'advisor') {
            const referenceAssessmentInboxIndex = arrayUtility.findIndexByKeyValue(foundRequestUser.inbox, 'assessment_id', assessmentID);
            if (referenceAssessmentInboxIndex != null) {
                const assessmentHolderID = foundRequestUser.inbox[referenceAssessmentInboxIndex].from_user_id;
                User.findById(assessmentHolderID, (err, foundAssessmentHolder) => {
                    if (err) {
                        console.error(err);
                        return res.render(frontEndRoot + 'error/error.ejs', {
                            user: req.user,
                            error: 500,
                            type: 'Error on DB connection.',
                            message: 'Please try again later, or contact us.'
                        });
                    }
                    const assessmentIndex = arrayUtility.findIndexByKeyValue(foundAssessmentHolder.submitted_assessment_history, 'id', assessmentID);
                    if (assessmentIndex != null) {
                        return res.render(frontEndRoot + 'assessment-report.ejs', {assessment: foundAssessmentHolder.submitted_assessment_history[assessmentIndex], user:req.user});
                    }
                    return res.render(frontEndRoot + 'error/error.ejs', {
                        user: req.user,
                        error: 404,
                        type: 'Error searching assessment.',
                        message: 'Assessment does not exist.'
                    });
                });
            } else {
                return res.render(frontEndRoot + 'error/error.ejs', {
                    user: req.user,
                    error: 404,
                    type: 'Error reference assessment.',
                    message: 'This assessment has some issues.'
                });
            }
        } else if (foundRequestUser[foundRequestUser['type']].role === 'student') {
            // request made by student
            User.findById(requestUserID, (err, foundAssessmentHolder) => {
                if (err) {
                    console.error(err);
                    return res.render(frontEndRoot + 'error/error.ejs', {
                        user: req.user,
                        error: 500,
                        type: 'Error on DB connection.',
                        message: 'Please try again later, or contact us.'
                    });
                }
                const assessmentIndex = arrayUtility.findIndexByKeyValue(foundAssessmentHolder.submitted_assessment_history, 'id', assessmentID);
                if (assessmentIndex != null) {
                    return res.send({assessment: foundAssessmentHolder.submitted_assessment_history[assessmentIndex]});
                }
                return res.render(frontEndRoot + 'error/error.ejs', {
                    user: req.user,
                    error: 404,
                    type: 'Error searching assessment.',
                    message: 'Assessment does not exist.'
                });
            })
        } else {
            // request user is either advisor or student
            return res.render(frontEndRoot + 'error/error.ejs', {
                user: req.user,
                error: 403,
                type: 'Forbidden premission.',
                message: 'Unindentified user type.'
            });
        }

    })

})

module.exports = router;

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

const setIO = (io) => {
    _io = io;
    console.log("√ Load socket.io in profile API.".green);
}
module.exports.setIO = setIO;

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

// after updateUserSelfDescription is called
const getAndUpdatePersonalityAssessment = (user, description) => {
    return new Promise((resolve, reject) => {
        personality.getAnalysis(description).then(assessment => updateUserPersonalityAssessment(user, assessment).then(resolve()).catch(err => {
            console.error(err);
            reject(err);
        }));
    });

}

var countWords = (s) => {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    s = s.replace(/\n /, "\n");
    return s.split(' ').length;
}

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
