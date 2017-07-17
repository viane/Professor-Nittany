'use strict'

const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
import config from '../../config';

const initPersonalityAPI = () => {
  return new Promise(function(resolve, reject) {
    resolve(new PersonalityInsightsV3({
      username: config.watson.PersonalityInsightsV3.username,
      password: config.watson.PersonalityInsightsV3.password,
      version_date: '2016-10-20',
      headers: {
        'X-Watson-Learning-Opt-Out': 'false'
      }
    }));
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
