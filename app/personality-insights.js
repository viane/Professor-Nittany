'use strict'

const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
const loadJsonFile = require('load-json-file');

loadJsonFile(appRoot + '/config/credential.json').then(credential => {
    const personality_insights = new PersonalityInsightsV3({
        username: credential.personality_insights_credential.username,
        password: credential.personality_insights_credential.password,
        version_date: '2016-10-20',
        headers: {
            'X-Watson-Learning-Opt-Out': 'false'
        }
    })
}

module.exports.getAnalysis = function(input) {

    const params = {
        // Get the content items from the JSON file.
        test: input,
        raw_scores: true,
        headers: {
            'accept-language': 'en',
            'accept': 'text/plain'
        }
    };

    return new Promise(function(resolve, reject) {
        personality_insights.profile(params, (err, response) => {
            if (err) {
                throw err;
                reject(err);
            } else {
                console.log(JSON.stringify(response, null, 2));
                resolve(response);
            }
        });
    });

};
