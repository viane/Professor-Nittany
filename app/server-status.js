'use strict'

const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const appRoot = require('app-root-path');
const serverStatusPath = '/config/server-status.json';


module.exports.updateStatsFromQuestionObj = function(questionObj) {
    return null;
};

module.exports.getRecentAskedQuestions = () => {
    return new Promise((resolve, reject) => {
        loadJsonFile(appRoot + serverStatusPath).then(json => {
            resolve(json.recent_asked_question);
        }).catch((err) => {
            throw err;
            reject(err);
        })
    })
};

module.exports.updateRecentAskedQuestions = (Question) => {
  return new Promise((resolve, reject) => {
    loadJsonFile(appRoot + serverStatusPath).then(json => {
        // 3 cases, the question is new, already in the list but still asked recently, already asked but long time ago
        if(!json.recent_asked_question.include(Question)){
          // server only store max 50 of recently asked questions
          if (json.recent_asked_question.length >= 50) {
            json.recent_asked_question.shift();
          }
        }else{
          // swap the oldone with newer one
          const oldIndex = json.recent_asked_question.indexOf(Question);
          json.recent_asked_question.slice(oldIndex,1);
        }
        json.recent_asked_question.push(Question);

        writeJsonFile(appRoot + serverStatusPath, json).then(()=>{
            resolve(json);
        }).catch((err) => {
            throw err;
            reject(err);
        })
    }).catch((err) => {
        throw err;
        reject(err);
    })
  })


};

module.exports.getCurrentOnlineUser = () => {
    loadJsonFile(appRoot + serverStatusPath).then(json => {
        return json.current_online_user;
    }).catch((err) => {
        throw err;
    })
}
