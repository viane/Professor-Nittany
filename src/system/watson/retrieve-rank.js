'use strict'

const watson = require('watson-developer-cloud');
const qs = require('qs'); //  Use a querystring parser to encode output.
const config = require('../../config');

const retrieve_and_rank = watson.retrieve_and_rank(config.watson.retrieve_and_rank);

const solrClient = retrieve_and_rank.createSolrClient(config.watson.rrparams);

const ranker_id = config.watson.ranker_id;

exports.enterMessage = function(inputText, questionTopic) {
    return new Promise(function(resolve, reject) {
        const rrquery = qs.stringify({q: inputText, ranker_id: ranker_id, rows: 10, fl: 'id,answer_id,score,ranker.confidence,title,body'});
        //ask retrive and rank
        solrClient.get('fcselect', rrquery, function(err, searchResponse) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                if (searchResponse.response.numFound === 0) {
                    // no answer was found in retrieve and rank
                    return resolve({
                        response: {
                                docs: [
                                        {
                                            title: "No answer found",
                                            body: "Sorry I can't find any answer for this question, please ask a different question.",
                                            'ranker.confidence' : 0
                                        }
                                ]
                        }
                    });
                } else {
                    // sort by confidence
                    searchResponse.response.docs.sort(function(a, b) {
                        return b['ranker.confidence'] - a['ranker.confidence'];
                    });
                    resolve (searchResponse);
                }
            }
        });
    });
};
