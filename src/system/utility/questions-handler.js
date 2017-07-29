const Questions = require('../../models/question');
const DominatedTerms = require('../../models/dominated-term');
import processQuestion from './process-question';
import retrieve_and_rank from '../watson/retrieve-rank';
import conversation from '../watson/conversation';
const config = require('../../config');


module.exports.questionHandler=function(myQuestion, id){
	return new Promise(function(resolve, reject){
		if(myQuestion.length>=5){
          Questions.findOne({body:myQuestion},function(err,resp){
          	if(resp){
          		if(!resp.submitter.includes(id)){
          			resp.submitter.push(id);
          		}
          		retrieve_and_rank.enterMessage(myQuestion).then((searchResponse) =>{
          			return resolve(searchResponse);
          		})
          		.catch((err)=>{
          			return reject(err);
          		})

          	}else{
          		var newQuestion = new Questions();
          		newQuestion.body = myQuestion;
          		newQuestion.submitter.push(id);
		        processQuestion.NLUAnalysis(myQuestion).then((analysis) => {
		            //console.log(analysis);
		            newQuestion.feature.concepts = analysis.concepts;
		            newQuestion.feature.keywords = analysis.keywords;
		            newQuestion.feature.entities = analysis.entities;
		            retrieve_and_rank.enterMessage(myQuestion).then((searchResponse) => {
		                //console.log(searchResponse.response.docs[0]['ranker.confidence']);
		            	if(searchResponse.response.docs[0]['ranker.confidence']<config.questionThreshold){
		                  //console.log(config.questionThreshold);
		                  newQuestion.low_confidence.mark = true;
		                  newQuestion.low_confidence.answer = searchResponse.response.docs[0].body;
		                  let features = [];
		                  features = features.concat(newQuestion.feature.concepts);
		                  features = features.concat(newQuestion.feature.keywords);
		                  features = features.concat(newQuestion.feature.entities);
		                  let Text = features.map(function(a){return a.text});
		                  let terms_match_count = 0;
		                  //console.log(Text);
		                  DominatedTerms.findById("5978f6b724e65c86144167b0", function(err, domTerms ){
		                    if(err) return reject(err);
		                    for(let j=0; j<Text.length; j++){
		                      if(domTerms.termsText.includes(Text[j])){
		                        terms_match_count++;
		                      }
		                    }
		                    if(Text.length == 0){
		                      newQuestion.low_confidence.relevance_percent = 0;
		                    }
		                    else{
		                      newQuestion.low_confidence.relevance_percent = terms_match_count/Text.length;
		                    }
		                    
		                    switch(newQuestion.low_confidence.relevance_percent){
		                      case 0:
		                        newQuestion.low_confidence.relevance_level="irrelevant";
		                        break;
		                      case 1:
		                        newQuestion.low_confidence.relevance_level="full";
		                        break;
		                      default:
		                        newQuestion.low_confidence.relevance_level="some";
		                    }
		                    searchResponse.context = {};
		                    newQuestion.save(function(err, resp){
		                      if(err) return reject(err);
		                      return resolve(searchResponse);
		                    });
		                  });
		                }
		                else{
		                  searchResponse.context = {};
		                  newQuestion.save(function(err, resp){
		                    if(err) return reject(err);
		                    return resolve(searchResponse);
		                  });
		                }
		               }).catch((err) => {
		                console.error(err);
		                return reject(err)
		              });

		        });
          	}
          });
            
        }
        else{
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
        }
	});
	
}
