'use strict';
/////////////////////////////////////////////////////////////////////////////
// Use for format alchemyAPI result in system.js update domain terms func
/////////////////////////////////////////////////////////////////////////////

module.exports.retrieveTermsFromAlchemyAPI = (_result, _opt) => {
    let termArray = [];

    if (!_opt) {
        // default threshold for each categorie terms to be considered add into knowledge domain
        _opt = {
            "threshold": {
                "concept": 0.4,
                "entity": 0.8,
                "taxonomy": 0.3,
                "keyword": 0.5
            }
        }
    }

    _result.concepts.map((concept) => {
        if (concept.relevance >= _opt.threshold.concept) {
            termArray.unshift(concept.text.trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    })

    _result.entities.map((entity) => {
        if (entity.relevance >= _opt.threshold.entity) {
            termArray.unshift(entity.text.trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    })

    _result.taxonomy.map((taxonomy) => {
        if (taxonomy.score >= _opt.threshold.taxonomy) {
            termArray.unshift(taxonomy.label.split("/").pop().trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    })

    _result.keywords.map((keyword) => {
        if (keyword.relevance >= _opt.threshold.keyword) {
            termArray.unshift(keyword.text.replace("no-title.","").trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    })

    return termArray;
}

/////////////////////////////////////////////////////////////////////////////
// Preprocessing key function in process-question.js
/////////////////////////////////////////////////////////////////////////////

// this function is the core algorithm for preprocessing, which should be updated and optimized mostly
module.exports.convertPerspectsToAIReadable = (perspect_type, content) => {
    let AI_Read_String = "";

    // reference Doc/markdown/alchemyAPI response example.md for example output of each perspect

    switch (perspect_type) {
        case "concept":
            content.map((perspect) => {
                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = Math.round(perspect.relevance * 10);

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;

        case "keyword":
            content.map((perspect) => {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = Math.round(perspect.relevance * 10);

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;

        case "entity":
            content.map((perspect) => {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = perspect.count;

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;

        case "taxonomy":
            content.map((perspect) => {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                const weight = perspect.count;

                // multiple this concept to the weight ( make this concept repeat wright times)

                const wordSplitBySplash = perspect.label.split("/");
                const taxonomy = wordSplitBySplash.pop();

                for (let i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(taxonomy.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;
    }

    return AI_Read_String;
}

module.exports.removeTagsAndRelateInfoFromSMSAnswer = (answerText)=>{
  let answer = answerText;
  // use RegExp remove targeted tags and content between tags
  // rules:
  // 1. remove [a][/a],[extend][/extend],[email][/email] tags
  // 2. remove tags and whats in between of following tags: [link][/link],[email-addr][/email-addr],[img][/img]
  answer = answer.replace(/\[a\]/g,'').replace(/\[\/a\]/g,'').replace(/\[email\]/g,'').replace(/\[\/email\]/g,'').replace(/\[extend\]/g,'').replace(/\[\/extend\]/g,'');
  answer = answer.replace(/\[link\][\s\S]*?\[\/link\]/g,'').replace(/\[email-addr\][\s\S]*?\[\/email-addr\]/g,'').replace(/\[img\][\s\S]*?\[\/img\]/g,'');

  return answer;
}
/////////////////////////////////////////////////////////////////////////////
// Format user interest for wordClound2.js
/////////////////////////////////////////////////////////////////////////////
module.exports.convertUserInterestTowordCloud = function (interest) {
  // [{term, value},...] to [[term, (int)value],...]
  return interest.map((interest)=>{
    return [interest.term, parseInt(interest.value,10)+1];
  })
};
