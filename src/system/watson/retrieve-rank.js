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

// run cluster check on system up
retrieve_and_rank.listCollections({
  cluster_id: 'scfdc7ceae_2dd2_4b6e_88c7_be14c54e4d07'
},
  function (err, response) {
    if (err)
      console.error('retrieve and rank error:', err);
});

// following code might solve RR cluster schema failure, from Allen
// var params1 = {
//   cluster_id: 'scfdc7ceae_2dd2_4b6e_88c7_be14c54e4d07',
//   collection_name: 'Intelligent-Academic-Advisor-WorldCampus',
// };
//
// var doc = {
//     id: 500,
//     body: 'He is trying to fix the cluster failure, but even he thinks most likely he wont success.',
//     title: 'A mysterous hero'
// };
//
// var solrClient1 = retrieve_and_rank.createSolrClient(params1);
//
// solrClient1.add(doc, function (err, response) {
//   if (err) {
//     console.log('Error indexing document: ', err);
//   }
//     else {
//       console.log('Indexed a document.');
//       solrClient.commit(function(err) {
//         if(err) {
//           console.log('Error committing change: ' + err);
//         }
//           else {
//             console.log('Successfully committed changes.');
//           }
//       });
//     }
// });
