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
                    res.sendStatus(200);
                }).catch(function(err) {
                    throw err;
                    res.sendStatus(300);
                });

                const dataText = data.toString();

                // personality analysis only takes input that is more than 100 words
                if (countWords(dataText) > 105) {
                    getAndUpdatePersonalityAssessment(req.user, dataText);
                }
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
                        file: fs.createReadStream(filePath), conversion_target: 'ANSWER_UNITS',
                        // Use a custom configuration.
                        config: json.document_conversion_config
                    }, (err, response) => {
                        if (err) {
                            throw err;
                        } else {

                            const fullDoc = wordToText.combineResult(response);

                            updateUserSelfDescription(req.user, fullDoc).then(() => {
                                // done write to DB, delete file
                                del.promise([filePath]).then(() => {}).catch((err) => {
                                    throw err;
                                });
                                res.sendStatus(200);
                            }).catch(function(err) {
                                // if error on write to DB, leave the file in the folder for further examnaton
                                throw err;
                                res.sendStatus(300);
                            });
                            // personality analysis only takes input that is more than 100 words
                            if (countWords(fullDoc) > 105) {
                                getAndUpdatePersonalityAssessment(req.user, fullDoc);
                            }
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
        const interestPath = getInterestPathFromUser(foundUser);
        res.send({status: "success", information: "good", interest: foundUser[interestPath].interest});
    }).catch((err) => {
        throw err;
        res.send({type: 'error', information: err});
    })
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

})

router.post('/set-privacy', (req, res) => {
    res.send({status: "success", information: "API not open yet"});
})

router.post('/favorite-question', (req, res) => {
    const id = req.user._id;
    console.log(req.user);
    res.send({status: "success", information: "done!"});
});

router.post('/like-question', (req, res) => {
    const id = req.user._id;
    console.log(req.user);
    res.send({status: "success", information: "done!"});
});

module.exports = router;

const getUserDataPath = (userType) => {
    let path = "";
    switch (userType) {
        case "local":
            path = "local.personality_assessement";
            break;
        case "twitter":
            path = "twitter.personality_assessement";
            break;
        case "linkedin":
            path = "linkedin.personality_assessement";
            break;
        case "facebook":
            path = "facebook.personality_assessement";
            break;
        default:
            throw new Error("System try to evaluate user personality but user type is unexcepted");
            break;
    }
    return path;
}

const updateUserSelfDescription = (user, description) => {
    const id = user._id;
    const updatePath = getUserDataPath(user.type);

    return new Promise((resolve, reject) => {
        User.update({
            _id: id
        }, {
            $set: {
                [updatePath]: {
                    last_upload_time: new Date().toISOString(),
                    description_content: description.toString('utf8'),
                    evaluation: ""
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
    const updatePath = getUserDataPath(user.type) + ".evaluation";

    return new Promise((resolve, reject) => {

        User.update({
            _id: id
        }, {
            "$set": {
                [updatePath]: assessment
            }
        }).exec().then((query_report) => {
            resolve(query_report);
        }).catch((err) => {
            throw err
            reject(err);
        });
    });

}

const getAndUpdatePersonalityAssessment = (user, description) => {
    personality.getAnalysis(description).then(assessment => updateUserPersonalityAssessment(user, assessment).then().catch(err => {
        throw err
    }))
}

var countWords = (s) => {
    s = s.replace(/(^\s*)|(\s*$)/gi, "");
    s = s.replace(/[ ]{2,}/gi, " ");
    s = s.replace(/\n /, "\n");
    return s.split(' ').length;
}

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
