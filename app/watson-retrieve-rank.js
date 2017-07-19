'use strict'

var watson = require('watson-developer-cloud');
var qs = require('qs'); //  Use a querystring parser to encode output.

var retrieve_and_rank = watson.retrieve_and_rank({username: 'a658754c-09f3-4cc4-a8a1-198a25cd295e', password: 'KTldeBICAwNp', version: 'v1'});

var rrparams = {
    cluster_id: 'scd1a4815e_895b_4a51_b8da_239255267abd',
    collection_name: 'Intelligent-Academic-Planner-Collection'
};

var solrClient = retrieve_and_rank.createSolrClient(rrparams);

var ranker_id = '1eec74x28-rank-4480';

exports.enterMessage = function(inputText, questionTopic) {
    return new Promise(function(resolve, reject) {
        var rrquery = qs.stringify({q: inputText, ranker_id: ranker_id, rows: 30, fl: 'id,answer_id,score,ranker.confidence,title,body'});
        //ask retrive and rank
        solrClient.get('fcselect', rrquery, function(err, searchResponse) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(searchResponse);
            }
        });
    });
}

// add credential check function

// add cluster check function

// add rankserStatus check function
