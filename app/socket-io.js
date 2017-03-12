const appRoot = require('app-root-path');
const questionAnswer = require('./question-answer');

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

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function(data) {

            const currentInput = data.content;

            console.log("Client sent a message : " + JSON.stringify(data));

            if (user.id && user.type) {
                //socket.request.user && socket.request.user.logged_in
                //login user block

                if (user.id === data.sender.id && user.type === data.sender.type) {
                    // ask system
                    questionAnswer.ask(user, currentInput).then(function(result) {
                        socket.emit('new message', {message: result.response.docs, confidence:result.inDomain});
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
                    socket.emit('new message', {message: result.response.docs, confidence:result.inDomain});
                }).catch(function(err) {
                    console.log(err);
                });
            };

            ////////////////////////////////////////////////////////////
            // used in demo, feed client analysis of last asked question
            ////////////////////////////////////////////////////////////
            if (data.sender.id === "58927ed26d256512009d6b64") {
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
        // when the user disconnects.. perform this
        socket.on('disconnect', function() {
            console.log("A user disconnected socket connection");
            // echo globally that this client has left
        });
    });
};
