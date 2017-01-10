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
                generateNotice('error', "<div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> Question can't not be empty</div>"); //call Noty with message
            }
            else {
                $.ajax({
                    url: '/postQuestionAnswer',
                    type: 'post',
                    data: queryData
                }).done(function(data) {
                    if (data.status === "1") { //call Noty with message for success
                        generateNotice('success', "<div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> "+data.message+"</div>");
                        questionContext.val(""); //clear text input
                        answerContext.val("");
                        tagContext.val("");
                    }
                    else {
                        //err
                        if (data.status === "0") { //call Noty with message for alert
                            generateNotice('alert', "<div><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i> "+data.message+"</div>");
                        }
                        if (data.status === "-1") { //call Noty with message for error
                            generateNotice('error', "<div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> "+data.message+"</div>");
                        }
                    }
                });
            }
        })
    }

})
