var watson = require('watson-developer-cloud');
var qs = require('qs'); //  Use a querystring parser to encode output.

const retrieve_and_rank = watson.retrieve_and_rank({username: 'a658754c-09f3-4cc4-a8a1-198a25cd295e', password: 'KTldeBICAwNp', version: 'v1'});

const rrparams = {
    cluster_id: 'scd1a4815e_895b_4a51_b8da_239255267abd',
    collection_name: 'Intelligent-Academic-Planner-Collection'
};

let solrClient = retrieve_and_rank.createSolrClient(rrparams);

const ranker_id = '766366x22-rank-2623';

exports.enterMessage = function(inputText) {
    return new Promise(function(resolve, reject) {
        const rrquery = qs.stringify({q: inputText, ranker_id: ranker_id, fl: 'id,answer_id,score,confidence,title,body'});
        //ask retrive and rank
        solrClient.get('fcselect', rrquery, function(err, searchResponse) {
            if (err) {
                console.log(err)
                reject(err);
            } else {
                resolve(searchResponse);
            }
        });
    });
}
