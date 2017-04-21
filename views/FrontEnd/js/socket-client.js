$(function() {
    // Initialize variables
    const $window = $(window);
    //var $usernameInput = $('.usernameInput'); // Input for username
    //var $messages = $('.messages'); // Messages area

    let user = {};
    user.id = $("#user-id").text().trim(); //assgin user id
    user.type = $("#user-type").text().trim(); //assgin user type

    const socket = io();

    socket.on('connect', function() {
        // console.log(socket.id); // 'G5p5...'
    });

    socket.on('dm', (message) => {
        console.log(message);
    })

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

    // when server send back an answer
    socket.on('answer', function(data) {
        addChatMessage("server", data);
        //console.log("server received your data and sent to you: " +JSON.stringify(data.message));
    });

    ////////////////////////////////////////////////////////////////////////
    // when server send back analysis of last asked question from test user
    // currently only used in demo /status
    ////////////////////////////////////////////////////////////////////////
    socket.on('question-analysis', function(data) {
        displayAnalysis(data);
    });

    ////////////////////////////////////////////////////////////////////////
    // Inbox message
    ////////////////////////////////////////////////////////////////////////
    socket.on('inbox', function(data) {});

    ////////////////////////////////////////////////////////////////////////
    // Feedback after send assessment
    ////////////////////////////////////////////////////////////////////////
    // success
    socket.on('success-submit-assessment', (data) => {
        generateNotice('success', data.message);
        setTimeout(() => {
            $('#assessment-advisor-exit-btn').click();
        }, 1400);
    });

    // fail
    socket.on('fail-submit-assessment', (err) => {
        generateNotice('success', data.err);
    });

    ////////////////////////////////////////////////////////////////////////
    // To Advisor receive an assessment (need fix)
    ////////////////////////////////////////////////////////////////////////
    socket.on('advsisor-receive-assessment', (data) => {

        if ($('#user-id').text() === data.id) {
            generateNotice('success', "A student wants you to view assessment");

            if (window.location.href === "http://localhost:3000/advising" || window.location.href === "https://intelligent-student-advisor.herokuapp.com/advising") {
                $(".panel-primary").append("<p>View Section:" + JSON.stringify(data.viewSection) + "</p><pre>" + JSON.stringify(data.student) + "</pre>")
            }
        }
    })

    const displayAnalysis = (data) => {
        //clear previous result
        $('#last-question-analysis').html("");

        // output concept with confidence
        data.analysis.concepts.map((concept) => {
            $('#last-question-analysis').append("<div class=\"col-md-4\"><h1>Concepts</h1><p>" + concept.text + " " + parseFloat(concept.relevance).toPrecision(3) * 100 + "%</p></div>");
        });

        data.analysis.entities.map((entity) => {
            $('#last-question-analysis').append("<div class=\"col-md-4\"><h1>Entities</h1><p>" + entity.type + " " + entity.text + " " + parseFloat(entity.relevance).toPrecision(3) * 100 + "% " + "</p></div>");
        });

        data.analysis.taxonomy.map((taxonomy) => {
            $('#last-question-analysis').append("<div class=\"col-md-4\"><h1>Taxonomies</h1><p>" + taxonomy.label + " " + parseFloat(taxonomy.score).toPrecision(3) * 100 + "%</p></div>");
        });

        data.analysis.keywords.map((keyword) => {
            $('#last-question-analysis').append("<div class=\"col-md-4\"><h1>Keywords</h1><p>" + keyword.text + " " + parseFloat(keyword.relevance).toPrecision(3) * 100 + "%</p></div>");
        });

    };

    var chatWindow = $('#answer-list'); //main chat window

    // send message to server by use emit api form socket io
    $('#querySubmitBtn').click(function() {

        // clear previous results
        $('#answer-list').empty();

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
            socket.emit('question', message);
            addChatMessage("client", message.content);
        }
    });

    //update display message function
    var addChatMessage = function(sender, data) {
        // hide answer warning message by default
        $('#answer-low-confidence-warning').addClass("hide");

        if (sender === "server") {

            const message = data.message;
            // data.confidence (bool) indicates either user's question is in the knowledge doman or not

            if (!data.confidence) {

                // if question is not in the knowledge domain

                // prompt a warning to user that answer might not accurate due to unsure knowledge domain
                $('#answer-low-confidence-warning').removeClass("hide");

            }

            // display 10 answers from server in order of confidence
            message.map((answer, index) => {
                let respond;
                if (index == 0) {
                    //form new DOM respond element
                    respond = "<li class=\"list-group-item list-group-item-info text-left\">"

                } else {
                    //form new DOM respond element
                    respond = "<li class=\"list-group-item text-left\">"
                }

                //add favorite btn to answer
                respond += "<div id=\"hearts-existing\" class=\"hearrrt question-fav-btn-main\" data-toggle=\"tooltip\" data-container=\"body\" data-placement=\"right\" title=\"Favorite!\"></div>"

                //add answer body and
                respond += "<div class=\"answer\"><p class=\"answer-body\">" + formatAnswerByTag(answer.body) + "</p></div>";

                //add rating btn
                respond += "<span id=\"stars-existing\" class=\"starrr\" data-toggle=\"tooltip\" data-placement=\"left\" title=\"Rate!\"></span>"

                //end adding, wrap up whole section
                respond += "</li>"

                chatWindow.append(respond);

            })

            //add fav btn handler
            favoriteBtnHandler();

            if ($("#user-id").text()) {
                // enable heart layout on each answer
                $(".hearrrt").hearrrt();
            }

            // enable star layout on each answer
            $(".starrr").starrr();

            // add read more handler
            addReadmoreHandler();

            // add ask answer related question handler
            addAnswerRelatedQuestionHandler();
        }

        if (sender === "client") {
            //     // display user input question
            //     let askDomElement = "<li class='user'>";
            //     // add question body
            //     askDomElement += "<div class=\"question\"><p class=\"question-body\" data-question-seq=" + currentQuestionAnswerSequence + ">" + message + "</p></div>";
            //     askDomElement += "</li>";
            //     //chatWindow.append(askDomElement);
            $("#user-question").text(data);
            $("#sys-tip").remove();
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
