const questionAnswer = require('./question-answer');
const stringChecking = require('./utility-function/string-checking');
module.exports = function(server) {
    const io = require('socket.io').listen(server);
    //Socket.io handle user's input
    io.on('connection', function(socket) {
        var user = {};

        //when user init a socket from client side, record the user id and type for security purpose
        socket.on('load', function(data) {
            user.id = data.id;
            user.type = data.type;
        });

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function(data) {

            const currentInput = data.content;

            // if user input is less than 3 words
            if (stringChecking.countWords(currentInput) <= 2) {
                socket.emit('new message', {
                    message: [
                        {
                            title: "Minimum input restriction",
                            body: "Sorry your question is too short to be answered, please type more about your question."
                        }
                    ]
                });
                return;
            }

            console.log("Client sent a message : " + JSON.stringify(data));

            if (user.id && user.type) {
                //socket.request.user && socket.request.user.logged_in
                //login user block

                if (user.id === data.sender.id && user.type === data.sender.type) {
                    // ask system
                    questionAnswer.ask(user, currentInput).then(function(result) {
                        socket.emit('new message', {message: result.response.docs});
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
                    socket.emit('new message', {message: result.response.docs});
                }).catch(function(err) {
                    console.log(err);
                });
            }
        });
        // when the user disconnects.. perform this
        socket.on('disconnect', function() {
            console.log("A user disconnected socket connection");
            // echo globally that this client has left
        });
    });
};
