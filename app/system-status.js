'use strict'

const appRoot = require('app-root-path');
const LineByLineReader = require('line-by-line'),
    lr = new LineByLineReader(appRoot + '/config/conversation-entity-config.csv',{ encoding: 'utf8',
  skipEmptyLines: true });

let knowledgeTerms = [];

// load question to server when server is starting
// return a promise
module.exports.initGetKnowledgeDomain = () => {
    return new Promise((resolve, reject) => {

        lr.on('error', function(err) {
            // 'err' contains error object
            console.error(err);
            reject(err)
        });

        lr.on('line', function(line) {
          const domainTerm = line.split(",");
          knowledgeTerms.unshift(domainTerm[1].trim());
        });

        lr.on('end', function() {
            // All lines are read, file is closed now.
            resolve();
        });

    });
};

module.exports.getKnowledgeTerm = () => {
  return knowledgeTerms;
}

module.exports.setKnowledgeTerm = (newKnowledgeTerms)=>{
  knowledgeTerms = newKnowledgeTerms;
}
