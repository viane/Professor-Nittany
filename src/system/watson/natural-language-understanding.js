'use strict'

const config = require('../../config');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const natural_language_understanding = new NaturalLanguageUnderstandingV1(config.watson.NaturalLanguageUnderstanding);

module.exports.getAnalysis = function(inputString,entityGetLimit = 5, keywordGetLimit= 10, conceptGetLimit= 3) {

    const parameters = {
        'language': 'en',
        'text': inputString,
        'features': {
            'entities': {
                'emotion': false,
                'sentiment': false,
                'limit': entityGetLimit
            },
            'keywords': {
                'emotion': false,
                'sentiment': false,
                'limit': keywordGetLimit
            },
            'concepts': {
                'emotion': false,
                'sentiment': false,
                'limit': conceptGetLimit
            }
        }
    }

    return new Promise((resolve, reject) => {
        natural_language_understanding.analyze(parameters, function(err, response) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
}
