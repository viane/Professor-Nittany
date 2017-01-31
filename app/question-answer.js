'use strict'

const appRoot = require('app-root-path');
const conversation = require('./watson-conversation');
const retrieveRank = require('./watson-retrieve-rank');
const processAnswer = require('./process-answer');
const processQuestion = require('./process-question');
let User = require(appRoot + '/app/models/user');

module.exports.ask = function(user, input) {

    if (user) {
        logUserQuestion(user, input);
    }

    return new Promise(function(resolve, reject) {
        const formattedInput = processQuestion.humanizeString(input);

        const questionTopic = processQuestion.getTopic(formattedInput); //returning an []

        logTopic(questionTopic);

        conversation.enterMessage(formattedInput).then(function(resultFromConversation) {
            // analysis result from conversation
            if (false) { // no need further ask...
                resolve(resultFromConversation);
            } else {
                // ask retrieve and rank
                retrieveRank.enterMessage(formattedInput).then(function(resultFromRR) {
                    //analysis result from retrieve and rank, then resolve plain text
                    processAnswer.final(resultFromRR, questionTopic).then(function(finalAnswerResult) {
                        resolve(finalAnswerResult);
                    })
                })
            }
        })
    });
};

var logUserQuestion = function(reqUser, input) {
    const user_id = reqUser.id;
    const user_type = reqUser.type;

    let path = "";
    switch (user_type) {
        case "local":
            path = "local.ask_history";
            break;
        case "twitter":
            path = "twitter.ask_history";
            break;
        case "linkedin":
            path = "linkedin.ask_history";
            break;
        case "facebook":
            path = "facebook.ask_history";
            break;
        default:
            throw new Error("System try to log user question but user type is unexcepted");
            break;
    }

    //need update newest asked time if question already exists

    User.findOneAndUpdate({
        "_id": user_id,
        [path.user_question_body]: {
            $ne: input
        }
    }, {
        "$addToSet": {
            [path]: {
                user_question_body: input
            }
        }
    }, function(err, doc) {
        if (err) {
            throw err; // handle error;
        }
    });

}

var logTopic = function(topics) {
    for (var i in topics) {
        var row = topics[i];
        console.log('Topic ' + (parseInt(i) + 1));

        // For each term.
        for (var j in row) {
            var term = row[j];
            console.log(term.term + ' (' + term.probability + '%)');
        }

        console.log('');
    }
}
