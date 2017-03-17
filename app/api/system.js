'use strict'
const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const busboy = require('connect-busboy');
const path = require('path');
const wordToText = require(appRoot + '/app/utility-function/word-file-to-text');
const del = require('delete');
const loadJsonFile = require('load-json-file');
const watson = require('watson-developer-cloud');
const document_conversion = watson.document_conversion({username: 'd1f406ed-2958-472b-80d6-f1f5a8f176f1', password: 'hiJHDXkxq16o', version: 'v1', version_date: '2015-12-15'});
const loginChecking = require(appRoot + '/app/utility-function/login-checking');
const fs = require('fs');
const alchemy = require(appRoot + '/app/alchemyAPI');
const systemStatus = require(appRoot + '/app/system-status');
const formatter = require(appRoot + '/app/utility-function/formatter');
const arrayUtility = require(appRoot + '/app/utility-function/array');
const csvWriter = require('csv-write-stream');

let documentText = "";

// API to update conversation filter domain by uploading document

router.post('/update/domain', loginChecking.isAdminRedirect, busboy({
    limits: {
        fileSize: 4 * 1024 * 1024
    }
}), (req, res, next) => {
    let fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename) => {
        if (path.extname(filename) === ".txt") {
            file.on('data', (data) => {
                documentText = data.toString();
                return next();
            });
        } else if (path.extname(filename) === ".doc" || path.extname(filename) === ".docx") {
            const filePath = appRoot + '/app/word-file-temp-folder/' + filename;
            fstream = fs.createWriteStream(filePath);
            // write file to temp folder
            file.pipe(fstream);
            fstream.on('close', () => {
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
                            documentText = wordToText.combineResult(response);
                            del.promise([filePath]).then(() => {
                                return next();
                            }).catch((err) => {
                                console.error(err);;
                            });
                        }
                    });
                });
            });
        }

    });
}, (req, res) => {

    alchemy.getAnalysis(documentText).then((result) => {
        if (result.status === "OK") {
            // get terms from result
            const formattedResultAry = formatter.retrieveTermsFromAlchemyAPI(result, {
                "threshold": {
                    "concept": 0.4,
                    "entity": 0.8,
                    "taxonomy": 0.3,
                    "keyword": 0.75
                }
            });

            // update systemStatus.knowledgeTerms (server memory)
            systemStatus.setKnowledgeTerm(arrayUtility.arrayUnique(systemStatus.getKnowledgeTerm().concat(formattedResultAry)));

            // write systemStatus.knowledgeTerms to disk
            const writer = csvWriter({separator: ',', newline: '\n', headers: undefined, sendHeaders: false});
            writer.pipe(fs.createWriteStream(appRoot + '/config/conversation-entity-config.csv'));
            systemStatus.getKnowledgeTerm().map((term) => {
                writer.write({entity_name: "About_Behrend", entity_value: term, entity_synonyms: ""});
            });
            writer.end();

            res.sendStatus(200);
        } else {
            res.sendStatus(302);
        }

    }).catch((err) => {
        console.error(err);
        res.sendStatus(302);
    })
});

module.exports = router;
