const appRoot = require('app-root-path');
const questionAnswer = require('./question-answer');
const User = require(appRoot + '/app/models/user');
const colors = require('colors');

module.exports = function(server) {
    const io = require('socket.io').listen(server);
    //Socket.io handle user's input
    io.on('connection', function(socket) {
        let user = {};

        //when user init a socket from client side, record the user id and type for security purpose
        socket.on('load', function(data) {
            user.id = data.id;
            user.type = data.type;
        });

        // when the client emits 'new question', this listens and executes
        socket.on('question', function(data) {

            const currentInput = data.content;

            console.log("Client sent a message : " + JSON.stringify(data));

            if (user.id && user.type) {
                //socket.request.user && socket.request.user.logged_in
                //login user block

                if (user.id === data.sender.id && user.type === data.sender.type) {
                    // ask system
                    questionAnswer.ask(user, currentInput).then(function(result) {
                        socket.emit('answer', {
                            message: result.response.docs,
                            confidence: result.inDomain
                        });
                    }).catch(function(err) {
                        console.log(err);
                    });
                } else {
                    //maybe exploit
                    console.error("A undetected user is send messages thru socket-io to server");
                }
            } else {
                //visitor's input block
                questionAnswer.ask(null, currentInput).then(function(result) {
                    socket.emit('answer', {
                        message: result.response.docs,
                        confidence: result.inDomain
                    });
                }).catch(function(err) {
                    console.error(err);
                });
            };

            ////////////////////////////////////////////////////////////
            // used in demo, feed client analysis of last asked question
            ////////////////////////////////////////////////////////////
            if (data.sender.id === "58c636153cd0ab4e32155583") {
                console.log("test user asked a question");
                const alchemyAPI = require(appRoot + '/app/alchemyAPI');
                alchemyAPI.getAnalysis(currentInput).then(function(analysis) {
                    socket.broadcast.emit('question-analysis', {analysis: analysis});
                }).catch((err) => {
                    throw err;
                })

            }
            ////////////////////////////////////////////////////////////
            // End of demo function
            ////////////////////////////////////////////////////////////

        });

        ////////////////////////////////////////////////////////////
        // client send advisor assessment(s)
        ////////////////////////////////////////////////////////////

        socket.on('client-send-assessment', function(data) {
            // prechecking
            if (data.senderID === "" || data.viewSection.length === 0 || data.receiveAdvisor.length === 0) {
                socket.emit('fail-submit-assessment', {'message': 'Sorry, there was an error when create assessment, please contact us.'});
                return;
            }

            // find client information
            User.findById(data.senderID, (err, user) => {
                if (err) {
                    console.error(err);
                    socket.emit('fail-submit-assessment', {'message': 'Sorry, there is an issue with your account, please contact us.'});
                    return;
                }

                ////////////////////////////////////////////////////////////
                // save request assessment to user DB
                ////////////////////////////////////////////////////////////
                // if conbine everthing and save with 1 call, the stack limit will be exceeded
                // so create record and save by each segment
                // cost more time and more calls, but save the day

                // on success create empty record
                const userInfoPath = getUserInformationPath(user);
                let assessmentCopy = {};
                // Comments will be stored as advisors' indivually
                if (data.viewSection.includes("question")) {
                    assessmentCopy.question = user[userInfoPath].ask_history;
                }

                if (data.viewSection.includes("personality")) {
                    assessmentCopy.personality_evaluation = user[userInfoPath].personality_assessement.evaluation.personality;
                }

                if (data.viewSection.includes("interest")) {
                    assessmentCopy.interest = user[userInfoPath].interest;
                }

                if (data.viewSection.includes("introduction")) {
                    assessmentCopy.introduction = user[userInfoPath].personality_assessement.description_content;
                }

                user.submitted_assessment_history.unshift(assessmentCopy);

                user.save((err, updatedStudentRecord) => {
                    if (err) {
                        console.error(err);
                        socket.emit('fail-submit-assessment', {'message': err});
                        return;
                    }

                    // save assessment to each advisor's DB
                    data.receiveAdvisor.map((advisorObj) => {
                        User.findById(advisorObj.id, (err, advisorRecord) => {
                            if (err) {
                                console.error(err);
                                socket.emit('fail-submit-assessment', {'message': 'Sorry, there is an issue with the advisor you select, please contact us.'});
                                return;
                            }
                            if (advisorRecord[advisorRecord.type].role != "advisor") {
                                console.error("A user send assessment to non-advisor account.".red);
                                return;
                            }
                            const assessment_id = updatedStudentRecord.submitted_assessment_history[updatedStudentRecord.submitted_assessment_history.length - 1]._id;
                            const assessmentInfoCopy = {
                                from_user_id: data.senderID,
                                assessment_id: assessment_id
                            };

                            advisorRecord.received_assessment_history.unshift(assessmentInfoCopy);
                            advisorRecord.save((err, newAdvisor) => {
                                if (err) {
                                    console.error(err);
                                    socket.emit('fail-submit-assessment', {'message': 'Sorry, there is an issue with the advisor you select, please contact us.'});
                                    return;
                                }
                            })
                            // notify this advisor that a student sent an assessment
                            // fix this, use socket.broadcast.to(socketid).emit(..) instead
                            socket.broadcast.emit('advsisor-receive-assessment', {
                                id: advisorObj.id,
                                student: updatedStudentRecord,
                                viewSection: data.viewSection
                            });
                        })
                    })
                    socket.emit('success-submit-assessment', {'message': 'Successly saved your assessment and sent to advisor.'});
                });
            })
        });

        // when the user disconnects
        socket.on('disconnect', function() {});
    });
};

const getUserInformationPath = (User) => {
    if (User.type === "local") {
        return "local";
    }
    if (User.type === "google") {
        return "google";
    }
    if (User.type === "linkedin") {
        return "linkedin";
    }
    if (User.type === "twitter") {
        return "twitter";
    }
    if (User.type === "facebook") {
        return "facebook";
    }
}

const formAssessmentObjByOption = (request, user) => {}
