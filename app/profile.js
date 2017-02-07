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

const user = require(appRoot + '/app/models/user');
const textract = require('textract');
const del = require('delete');

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
        id = req.user._id;
        const updatePath = getUserDataPath(req.user.type);

        if (path.extname(filename) === ".txt") {

            file.on('data', function(data) {
                user.update({
                    _id: id
                }, {
                    $set: {
                        [updatePath]: {
                            last_upload_time: new Date().toISOString(),
                            description_content: data,
                            evaluation: ""
                        }
                    }
                }).exec().then(function() {
                    res.sendStatus(200);
                }).catch(function(err) {
                    throw err
                    res.sendStatus(300);
                })
            });
        } else if (path.extname(filename) === ".doc" || path.extname(filename) === ".docx") {
            const filePath = appRoot + '/app/word-file-temp-folder/' + id + path.extname(filename);
            fstream = fs.createWriteStream(filePath);
            // write file to temp folder
            file.pipe(fstream);
            fstream.on('close', function() {
                textract.fromFileWithPath(filePath, function(error, text) {
                    if (error) {
                        throw error;
                        res.sendStatus(300);
                    } else {
                        console.log(text);
                        res.sendStatus(200);
                        // delete file
                        del.promise([filePath]).then(function() {}).catch(function(err) {
                            throw err;
                        });
                    }

                })

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
