const questionAnswer = require('./question-answer');

module.exports = function(server) {
    const io = require('socket.io').listen(server);
    //Socket.io handle user's input
    io.on('connection', function(socket) {
        var user = {};

        //when user init a socket from client side, record the suer id and type for security purpose
        socket.on('load', function(data) {
            user.id = data.id;
            user.type = data.type;
        });

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function(data) {
            console.log("Client sent a message : " + JSON.stringify(data));

            const currentInput = data.content;

            if (user.id && user.type) {
                //socket.request.user && socket.request.user.logged_in
                //login user block

                if (user.id === data.sender.id && user.type === data.sender.type) {
                    //analysis and log inputs
                    questionAnswer.ask(user, currentInput).then(function(result) {
                        socket.emit('new message', {message: result});
                    }).catch(function(err) {
                        console.log(err);
                    });
                }else{
                   //maybe exploit
                }
            } else {
                //visitor's input block

                //handle by queston and answer
                questionAnswer.ask(null, currentInput).then(function(result) {
                    socket.emit('new message', {message: result});
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
