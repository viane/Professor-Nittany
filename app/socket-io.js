const appRoot = require('app-root-path');
const questionAnswer = require('./question-answer');
const User = require(appRoot + '/app/models/user');

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

                //handle by queston and answer
                questionAnswer.ask(null, currentInput).then(function(result) {
                    socket.emit('answer', {
                        message: result.response.docs,
                        confidence: result.inDomain
                    });
                }).catch(function(err) {
                    console.log(err);
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
            // find client information
            User.findById(data.senderID, (err, user) => {
                if (err) {
                    console.error(err);
                    socket.emit('fail-notify-advisor','Failed to connect to advisors, please contact us.');
                    return;
                }
                const student = user;
                // push notification to inbox
                data.receiveAdvisor.map((advisorObj) => {
                    // fix this, use socket.broadcast.to(socketid).emit(..) instead
                    socket.broadcast.emit('advsisor-receive-assessment', {
                        id: advisorObj.id,
                        student: student,
                        viewSection: data.viewSection
                    });
                });
                // log assessment to DB
                socket.emit('success-notify-advisor',data.receiveAdvisor);
            })
        });

        // when the user disconnects.. perform this
        socket.on('disconnect', function() {
            console.log("A user disconnected socket connection");
            // echo globally that this client has left
        });
    });
};
