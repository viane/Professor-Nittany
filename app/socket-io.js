const questionAnswer = require('./question-answer');

module.exports = function(server) {
    var io = require('socket.io').listen(server);
    var Promise = require("bluebird");
    var conversation = Promise.promisifyAll(require('./watson-conversation'));

    //Socket.io handle user's input

    io.on('connection', function(socket) {
        var user = {};

        //when user init a socket from client side, record the suer id and type for security purpose
        socket.on('load', function(data) {
            user.id = data.id;
            user.type = data.type;
            //console.log("User connected thru a socket: " + JSON.stringify(user));
        });

        // when the client emits 'new message', this listens and executes
        socket.on('new message', function(data) {

            console.log("Client sent a message : " + JSON.stringify(data));

            var currentInput = data.content;

            if (user.id && user.type) {

                //login user block

                if (user.id === data.sender.id && user.type === data.sender.type) {
                    //analysis and log inputs
                    console.log("Sender info: " + JSON.stringify(data));

                    ///////////////////////////////////////////////////////
                    //check inputs corraltion to our domain's perspectives
                    ///////////////////////////////////////////////////////
                    socket.emit('new message', {message: "You are a loged in user"});
                }
            } else {
                //visitor's input block

                //handle by queston and answer
                questionAnswer.ask(currentInput).then(function(result) {
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
