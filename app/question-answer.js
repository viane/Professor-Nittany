'use strict'


const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');
const processAnswer = require('./process-answer');
const processQuestion = require('./process-question');
const serverStatus = require('./server-status');
const stringChecking = require('./utility-function/string-checking');
const profile = require('./profile');

module.exports.ask = (user, input) => {

    return new Promise((resolve, reject) => {

        // if user input is less than 3 words
        if (stringChecking.countWords(input) <= 2) {
            resolve({
                response: {
                    docs: [
                        {
                            title: "Minimum input restriction",
                            body: "Hi, your question is little bit short for me to give you a good answer, try be more specific (add few more words)."
                        }
                    ]
                },
                "inDomain": false
            })
        }

        // mannual preprocessing
        const userInput = processQuestion.humanizeString(input);

        // handled by conversation
        conversation.isInDomain(userInput).then((resultFromConversation) =>{
            ////////////////////////////////////////////////////////////////////////
            // demo use, for SE world campus schedule question only
            ////////////////////////////////////////////////////////////////////////
            conversation.askSEWorldCampusSchedule(userInput).then((resultFromConversation) =>{
              console.log(resultFromConversation[0]);
              if (resultFromConversation[0]==="positive") {
                resolve({
                    response: {
                        docs: [
                            {
                                title: "Penn State World Campus Software Engineering Bachelor Degree Course Schedule",
                                body: "Courses in the B.S. in Software Engineering program cover a wide array of software engineering topics including discrete mathematics, probability and statistics, and relevant topics in computer sciences and supporting disciplines for a comprehensive coverage of modern software and techniques. As a student, you can gain knowledge in areas such as computer programming, object-oriented methodology, software design, software validation and verification, software security, and computer networks.</br>[img]/world-campus-se-logo[/img]</br>View the detailed [a]Course List[/a].[link]/world-campus-software-engineering-schedule[/link]"
                            }
                        ]
                    },
                    "inDomain": true
                })
              }
            }).catch((err)=>{
              console.error(err);
              reject(err)
            })

            // analysis the concept, keyword, taxonomy, entities of the question
            processQuestion.NLUAnalysis(userInput).then(function(analysis) {

                // now process the question and rephrase to AI readable
                const questionObj = processQuestion.parseQuestionObj(userInput, analysis);

                if (user) {
                    // log question object to user DB
                    processQuestion.logUserQuestion(user, questionObj).then(() => {
                        // update user interest form question based on analysis
                        profile.updateInterest(user, analysis);
                    }).catch((err) => {
                        console.error(err);
                    })

                    // fix this to log to DB instead to fs
                    // update server question feeds with only user question string
                    processQuestion.updateQuestionToServerFeeds(questionObj.body);
                }

                // fix this too
                serverStatus.updateStatsFromQuestionObj(questionObj);

                // ask retrieve and rank
                // testing answer accuracy with 3 input mode:
                //                            question.body => user's original input
                //                            question.AI_Read_Body => AI weight based readable string
                //                            question.body + question.AI_Read_Body => hyper
                retrieveRank.enterMessage(questionObj.body + questionObj.AI_Read_Body).then(function(resultFromRR) {
                    if (resultFromRR.response.numFound === 0) {
                        // no answer was found in retrieve and rank
                        resolve({
                            response: {
                                docs: [
                                    {
                                        title: "No answer found",
                                        body: "Sorry I can't find any answer for this specific question, please ask a different question."
                                    }
                                ]
                            },
                            "inDomain": false
                        })
                    } else {
                        // question terms are in the current domain, return the answer directly
                        if (resultFromConversation[0] === 'in the domain') {
                            resultFromRR.inDomain = true;
                        }
                        // if not, attach a warning message with answer
                        if (resultFromConversation[0] === 'not in the domain') {
                            resultFromRR.inDomain = false;
                        }
                        resultFromRR.response.docs.sort(function(a, b) {
                            return b['ranker.confidence'] - a['ranker.confidence'];
                        });

                        while (resultFromRR.response.docs.length > 10) {
                            resultFromRR.response.docs.pop();
                        }

                        resolve(resultFromRR);
                    }
                }).catch(function(err) {
                    throw err;
                    reject(err);
                })

            }).catch(function(err) {
                throw err;
                reject(err);
            });

        })
    });
};
