/*global $*/
//This file manage query handlers


var checkDOM = function(ElementName) {
    if ($(ElementName)) {
        return true;
    }
    else {
        console.log("DOM element : " + ElementName + "does not exists.");
        return false;
    }
}

var showNotification = function(msg) {
    $('.notification span').text(msg);
    $('.notification').css('display', 'block');
    $('.notification').animate({
        opacity: 1
    }, 100);
}

var hideNotification = function() {
    $('.notification span').text("");
    $('.notification').animate({
        opacity: 0
    }, 200, function() {
        $('.notification').css('display', 'none');
    })
}

var showAnimateTranscripting = function() {
    var text = $(".transcripting_loading_span");
    var dots = $(".dot");
    text.css('display', 'block');
    text.animate({
        opacity: 1
    }, 1200);
    dots.each(function() {
        $(this).css('display', 'block');
        $(this).animate({
            opacity: 1
        }, 1200);
    })
}

var hideAnimateTranscripting = function() {
    var text = $(".transcripting_loading_span");
    var dots = $(".dot");
    text.animate({
        opacity: 0
    }, 100, function() {
        text.css('display', 'none');
    });
    dots.each(function() {
        $(this).animate({
            opacity: 0
        }, 100, function() {
            $(this).css('display', 'none');
        });
    })
}

//auto scroll to bottom where the newest asked and answered info appears.
var scrollChatWindowToBottom = function() {
    $(".chat-thread").animate({
        scrollTop: $(".chat-thread").height()
    }, 800);
}


$(document).ready(function() {

    //replacing by socket.io

    // /////////////////////////////////////////////////////////////////////////////////////////
    // //Event handlers for user submiting question and receiving answer from client to server
    // /////////////////////////////////////////////////////////////////////////////////////////

    // //update chat window with newly input and answered information
    // if (checkDOM('.chat-thread')) {
    //     var chatWindow = $('.chat-thread');
    // }

    // if (checkDOM('#querySubmitBtn')) {
    //     $('#querySubmitBtn').click(function() {
    //         var self = $(this);
    //         setTimeout(function() {
    //             self.addClass('loading');
    //         }, 125);
    //         var inputQuery = $('#userQueryInput').val();
    //         chatWindow.append("<li class='user'><p>" + inputQuery + "</p></li>");
    //         $('#userQueryInput').val("");
    //         scrollChatWindowToBottom();
    //         $.ajax({
    //             url: '/query',
    //             type: 'get',
    //             data: {
    //                 "input": inputQuery
    //             },
    //             success: function(data) {
    //                 setTimeout(function() {
    //                     self.removeClass('loading');
    //                 }, 125);
    //                 var respond = "<li class='agent'>";
    //                 console.log(data);
    //                 if (data.status == "conversation") { //from conversation
    //                     for (var i = 0; i < data.result.length; i++) {
    //                         respond += "<p>" + data.result[i] + "</p>";
    //                     }
    //                 }
    //                 else {
    //                     respond += "<p>" + data.result.response.docs[0].body + "</p>";
    //                 }
    //                 respond += "</li>";
    //                 chatWindow.append(respond);
    //                 scrollChatWindowToBottom();
    //                 $('#userQueryInput').focus();
    //             }
    //         });
    //     });
    // }

    // if (checkDOM('#userQueryInput')) {
    //     //submit question when user press enter during typing
    //     $('#userQueryInput').keypress(function(e) {
    //         if (e.keyCode == 13) {
    //             e.preventDefault();
    //             if ($(this).val().length >= 2) {
    //                 $('#querySubmitBtn').click();
    //             }
    //             return false;
    //         }
    //     })
    // }

    // if (checkDOM('#voiceSubmitBtn')) {
    //     //voice to text btn handler
    //     $('#voiceSubmitBtn').click(function() {
    //             //toggleRecording(this);
    //             if ($(this).hasClass("recording")) {
    //                 // stop recording
    //                 audioRecorder.stop();
    //                 $(this).removeClass("recording");
    //                 audioRecorder.getBuffers(gotBuffers);
    //                 //notify user app is transcripting voice
    //                 hideNotification();
    //                 showAnimateTranscripting(); //notify voice is being transcripted
    //             }
    //             else {
    //                 // start recording
    //                 if (!audioRecorder) return;
    //                 $(this).addClass("recording");
    //                 audioRecorder.clear();
    //                 audioRecorder.record();
    //                 showNotification("Click record button again when finish speaking");
    //                 setTimeout(function() {
    //                     $('#userQueryInput').val("");
    //                 }, 200);
    //             }
    //         }

    //     );
    // }

    /////////////////////////////////////////////////////////////////////////////////////////
    //Event handlers for developer manage question and answer in console (admin.ejs)
    /////////////////////////////////////////////////////////////////////////////////////////

    if (checkDOM('#add-questionAnswer-submit-btn')) {
        $('#add-questionAnswer-submit-btn').click(function() {
            var questionContext = $('#add-questionAnswer-question-input');
            var answerContext = $('#add-questionAnswer-answer-textarea');
            var tagContext = $('#add-questionAnswer-question-tag-input');
            var queryData = {
                "question": questionContext.val(),
                "answer": answerContext.val(),
                "tag": tagContext.val()
            }
            if (questionContext.val().length == 0) {
                questionContext.focus();
                generate('error', "<div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> Question can't not be empty</div>"); //call Noty with message
            }
            else {
                $.ajax({
                    url: '/postQuestionAnswer',
                    type: 'post',
                    data: queryData
                }).done(function(data) {
                    if (data.status === "1") { //call Noty with message for success
                        generate('success', "<div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> "+data.message+"</div>");
                        questionContext.val(""); //clear text input
                        answerContext.val("");
                        tagContext.val("");
                    }
                    else {
                        //err
                        if (data.status === "0") { //call Noty with message for alert
                            generate('alert', "<div><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i> "+data.message+"</div>");
                        }
                        if (data.status === "-1") { //call Noty with message for error
                            generate('error', "<div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> "+data.message+"</div>");
                        }
                    }
                });
            }
        })
    }

})