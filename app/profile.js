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

router.post('/upload/upload-description-text-file', busboy({
    limits: {
        fileSize: 4 * 1024 * 1024
    }
}), function(req, res, next) {

    if (!req.busboy)
        return next('route');

    let fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function(fieldname, file, filename) {
        if (path.extname(filename) === ".txt") {
            file.on('data', function(data) {
                updateUserSelfDescription(req.user, data).then(function(query_report) {
                    res.sendStatus(200);
                }).catch(function(err) {
                    throw err;
                    res.sendStatus(300);
                })
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
                    }, function(err, response) {
                        if (err) {
                            throw err;
                        } else {
                            let fullDoc = ""; // will store all content in the word file as plain text

                            // fill up the fullDoc
                            for (const docIndex in response.answer_units) {
                                if (response.answer_units[docIndex].hasOwnProperty("title")) {
                                    fullDoc += response.answer_units[docIndex].title + ". ";
                                }
                                for (const textIndex in response.answer_units[docIndex].content) {
                                    if (response.answer_units[docIndex].content[textIndex].hasOwnProperty("text")) {
                                        fullDoc += response.answer_units[docIndex].content[textIndex].text;
                                    }
                                }
                            }

                            updateUserSelfDescription(req.user, fullDoc).then(function() {
                                // done write to DB, delete file
                                del.promise([filePath]).then(function() {}).catch(function(err) {
                                    throw err;
                                });
                                res.sendStatus(200);
                            }).catch(function(err) {
                                // if error on write to DB, leave the file in the folder for further examnaton
                                throw err;
                                res.sendStatus(300);
                            })
                        }
                    });
                });
            });

        }
    });
})

module.exports = router;

const getUserDataPath = function(userType) {
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

    return new Promise(function(resolve, reject) {
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
        }).exec().then(function(query_report) {
            resolve(query_report);
        }).catch(function(err) {
            throw err
            reject(err);
        });
    });
}

const updateUserPersonalityAssessment = (user, assessment) => {}

const getPersonalityAssessment = (user, description) => {
    personality.getAnalysis(description).then(assessment => updateUserPersonalityAssessment(user, assessment).then().catch(err => {throw err}))
}
