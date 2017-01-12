var watson = require('watson-developer-cloud');
var qs = require('qs'); //  Use a querystring parser to encode output.
var retrieve_and_rank = watson.retrieve_and_rank({username: '55076b34-3f2b-48e4-9d6f-9abd9ac92ce2', password: 'DtRHd7eq6Cs6', version: 'v1'});

var rrparams = {
    cluster_id: 'sc854a5c9f_416b_40d5_b471_00c90a0dc3d8',
    collection_name: 'behrend'
};

var solrClient = retrieve_and_rank.createSolrClient(rrparams);

var ranker_id = 'c852c8x19-rank-145',
    rrquestion; //store user question string

exports.enterMessage = function(inputText) {
    return new Promise(function(resolve, reject) {
    //wait until ranker
    //   var rrquery = qs.stringify({
    //     q: inputText,
    //     ranker_id: ranker_id,
    //     fl: 'id,answer_id,score,confidence,title,body'
    //   });
    //   //ask retrive and rank
    //   solrClient.get('fcselect', rrquery, function(err, searchResponse) {
    //     if (err) {
    //       console.log(err)
    //       reject(err);
    //     }
    //     else {
    //       resolve(searchResponse);
    //     }
    //   });
    resolve(inputText);
    });
}
