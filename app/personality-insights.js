'use strict'

const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const loadJsonFile = require('load-json-file');

const initPersonalityAPI = () => {
    return new Promise(function(resolve, reject) {
        loadJsonFile('../config/credential.json').then(credential => {
            resolve(new PersonalityInsightsV3({
                username: credential.personality_insights_credential.username,
                password: credential.personality_insights_credential.password,
                version_date: '2016-10-20',
                headers: {
                    'X-Watson-Learning-Opt-Out': 'false'
                }
            }));
        });
    });

}

module.exports.getAnalysis = input => {
    return new Promise(function(resolve, reject) {
        initPersonalityAPI().then(personality_insights => {
            const params = {
                // Get the content items from the JSON file.
                text: input,
                raw_scores: true
            };

            personality_insights.profile(params, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });

        }).catch(err => {
            throw err;
        });
    });

};
