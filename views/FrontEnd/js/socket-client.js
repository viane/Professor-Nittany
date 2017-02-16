$(function() {
    // Initialize variables
    var $window = $(window);
    var currentQuestionAnswerSequence = 0;
    //var $usernameInput = $('.usernameInput'); // Input for username
    //var $messages = $('.messages'); // Messages area

    var user = {};
    user.id = $("#user-id").text().trim(); //assgin user id
    user.type = $("#user-type").text().trim(); //assgin user type

    var socket = io();

    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Socket events

    // on page load, send server the user info of init the socket
    socket.emit('load', user);

    // when server send back a message
    socket.on('new message', function(data) {
        addChatMessage("server", data.message);
        //console.log("server received your data and sent to you: " +JSON.stringify(data.message));
    });

    var chatWindow = $('.chat-thread'); //main chat window

    // send message to server by use emit api form socket io
    $('#querySubmitBtn').click(function() {
        //add loading animation to submit button
        setTimeout(function() {
            $('#querySubmitBtn').addClass('loading');
        }, 125);

        var $inputMessage = $('#userQueryInput'); // Input message input box

        // Prevent markup from being injected into the message
        var message = {};
        message.sender = {};
        if ($("#user-id").text().trim())
            message.sender.id = $("#user-id").text().trim();
        if ($("#user-type").text().trim())
            message.sender.type = $("#user-type").text().trim();
        if (cleanInput($inputMessage.val()))
            message.content = cleanInput($inputMessage.val());

        // if there is a non-empty message and a socket connection
        if (message.content) {
            
            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', message);
            addChatMessage("client", message.content);
        }
    });

    //update display message function
    var addChatMessage = function(sender, message) {
        if (sender === "server") {
            //remove submit btn animation
            setTimeout(function() {
                $('#querySubmitBtn').removeClass('loading');
            }, 125);

            // display 10 answers from server in order of confidence
            message.map((answer)=>{
              //form new DOM respond element
              let respond = "<li class='agent'>";

              //add answer body and
              respond += "<div class=\"answer\"><p class=\"answer-body\" data-answer-seq="+currentQuestionAnswerSequence+">" + answer.body + "</p></div>";

              //add rating system to answer
              respond += "<div class=\"answer-feedback-section\">";
              respond += "<a class=\"answer-like-btn\" href=\"#\"><i class=\"fa fa-thumbs-up\" aria-hidden=\"true\"></i></a>";
              respond += "<a class=\"answer-fav-btn\" href=\"#\"><i class=\"fa fa-gratipay\" aria-hidden=\"true\"></i></a>";
              respond += "</div>";

              //end adding, wrap up whole section
              respond += "</li>";

              chatWindow.append(respond);
            })

            //add handler
            addLikeBtnHandler(currentQuestionAnswerSequence);
            currentQuestionAnswerSequence++;
            $('#userQueryInput').focus();
        }

        if (sender === "client") {
            let askDomElement = "<li class='user'>";
            //add question body
            askDomElement += "<div class=\"question\"><p class=\"question-body\" data-question-seq="+currentQuestionAnswerSequence+">" + message + "</p></div>";
            askDomElement += "</li>";
            chatWindow.append(askDomElement);
        }
    }

    //submit question when user press enter during typing
    $('#userQueryInput').keypress(function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            if ($(this).val().length >= 2) {
                $('#querySubmitBtn').click();
            }
            return false;
        }
    })
});
