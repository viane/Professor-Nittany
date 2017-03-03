//Noty lib for global notification
var generateNotice = function(type, text, timeout = _secToTimeUnit(3.5)) {
    if (timeout === undefined) {
        timeout = _secToTimeUnit(3.5); //default message out time
    }
    if (type === undefined || type === "") {
        type = "success";
    }
    var n = noty({
        text: text,
        type: type,
        dismissQueue: true,
        force: true,
        layout: 'topRight',
        closeWith: ['click'],
        theme: 'relax',
        killer: true,
        maxVisible: 2,
        animation: {
            open: 'animated bounceInRight',
            close: 'animated bounceOutRight',
            easing: 'swing',
            speed: 1200
        }
    });
};

////////////////////////////////////////////////////////
//toggle vew section in question manage page
////////////////////////////////////////////////////////

var trigerIDArray = ["view_question_btn", "add_question_btn", "analysis_question_btn", "upload_question_btn"]; //need get this dynamically
var targetIDArray = ["viewQuestionSection", "addQuestionSection", "analysisQuestionSection", "uploadQuestionFileSection"]; //need get this dynamically

var hideShowElementByIDOnClick = function(triger, target) {
    $("#" + target).css("display", "none");
    $("#" + triger).click(function() {
        //get index of target want to show
        var showIndex = trigerIDArray.indexOf(triger);
        //hide all other elements by exclude this index
        $(targetIDArray).each(function(index, value) {
            if (index != showIndex) {
                $("#" + value).hide(200);
            }
        })
        //toggle our target
        $("#" + target).toggle(200);
    });
}

////////////////////////////////////////////////////////
//text animation in admin/console/add question section
////////////////////////////////////////////////////////

var updateText = function(event) {
    var input = $(this);
    setTimeout(function() {
        var val = input.val();
        if (val != "")
            input.parent().addClass("floating-placeholder-float");
        else
            input.parent().removeClass("floating-placeholder-float");
        }
    , 1)
}

// question answer manage page tab toggle function and animation
$(document).ready(function() {
    //assign add question label handler
    $(".floating-placeholder input").keydown(updateText);
    $(".floating-placeholder input").change(updateText);
    $(".floating-placeholder textarea").keydown(updateText);
    $(".floating-placeholder input").change(updateText);

    //toggle display handler for manage question page
    hideShowElementByIDOnClick("view_question_btn", "viewQuestionSection");
    hideShowElementByIDOnClick("add_question_btn", "addQuestionSection");
    hideShowElementByIDOnClick("analysis_question_btn", "analysisQuestionSection");
    hideShowElementByIDOnClick("upload_question_btn", "uploadQuestionFileSection");
});

//Time utility functions, convert input time to milliseconds
let _secToTimeUnit = function(secs) {
    return 1000 * secs
};
let _minToTimeUnit = function(mins) {
    return mins * _secToTimeUnit(60)
};
let _hourToTimeUnit = function(hours) {
    return hours * _minToTimeUnit(60)
};
let _dayToTimeUnit = function(days) {
    return days * _hourToTimeUnit(24)
};
let _yearToTimeUnit = function(years) {
    return years * _dayToTimeUnit(365)
};

//////////////////////////////////////////////////
// User apply admin
//////////////////////////////////////////////////

$(document).ready(function() {
    $('#apply-admin-submit').on('click', function() {
        const code = $('#apply-admin-code').val().toString();
        if (code === undefined || code === null || code === "") {
            generateNotice('warning', 'Empty invitation code.');
            return;
        };
        const url = '/api/account/apply-admin';
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: "code=" + encodeURIComponent(code)
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', "Error, status code: " + res.status);
                return;
            }
            res.json().then(function(result) {
                generateNotice(result.type, result.information);
                setInterval(function() {
                    window.location.href = "/admin"
                }, 2500);
            })
        }).catch(function(err) {
            generateNotice('error', err)
        });
    })
});

//////////////////////////////////////////////
// admin upload questions by questions by text file
//////////////////////////////////////////////

//set up dropzone for drop file
Dropzone.autoDiscover = false;

// for upload question file at /QuestionAnswerManagement
$(function() {
    $("#upload-Question-Text-File").dropzone({url: "/api/admin/upload/upload-by-text-file"});
});

// for upload self description at /uploadPersonal
$(function() {
    $("#upload-description-Text-File").dropzone({url: "/api/profile/upload/upload-description-text-file"});
});

//////////////////////////////////////////////////
// user like/fav question answer handler functions
//////////////////////////////////////////////////
const addLikeBtnHandler = function(answerSequenceNumber) {
    $($('.answer-like-btn')[answerSequenceNumber]).on('click', function() {
        const targetAnswer = $('[data-answer-seq=' + answerSequenceNumber + ']').text();
        console.log(targetAnswer);
    });
};

//////////////////////////////////////////////////
// read more click handler to expand answer
//////////////////////////////////////////////////
const addReadmoreHandler = () => {
    $('.read-more').each(function() {
        $(this).on('click', function() {
            if ($(this).text() === "Read More") {
                $(this).text("Collapse")
                $(this).next().removeClass("hide");
            } else {
                $(this).text("Read More")
                $(this).next().addClass("hide");
            }
        })
    })
}

//////////////////////////////////////////////
// User sign up action
//////////////////////////////////////////////

$(document).ready(function() {
    $("#signup-form").on("submit", function(e) {
        e.preventDefault();

        // post signup request to server
        const url = '/signup';
        const $form = $(this),
            $formId = $form.attr('id');
        const query = $("#" + $formId).serialize();

        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: query
        }).then(function(res) {
            res.json().then(function(res) {
                if (res.status !== 200) {
                    generateNotice(res.type, "Error, " + res.information);
                    return;
                } else {
                    generateNotice(res.type, res.information);
                    setTimeout(function() {
                        window.location.href = '/profile';
                    }, 2500);
                }
            })
        }).catch(function(err) {
            generateNotice('error', err)
        });

    });
});

//////////////////////////////////////////////
// User login action
//////////////////////////////////////////////

$(document).ready(function() {
    $("#login-form").on("submit", function(e) {
        e.preventDefault();

        // post signup request to server
        const url = '/login';
        const $form = $(this),
            $formId = $form.attr('id');
        const query = $("#" + $formId).serialize();
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: query
        }).then(function(res) {
            res.json().then(function(res) {
                if (res.status !== 200) {
                    generateNotice(res.type, "Error, " + res.information);
                    return;
                } else {
                    generateNotice(res.type, res.information);
                    setTimeout(function() {
                        window.location.href = '/profile';
                    }, 1000);
                }
            })

        }).catch(function(err) {
            generateNotice('error', err)
        });

    });
});

//////////////////////////////////////////////
// Input password view toggle handler
//////////////////////////////////////////////

$(function() {
    $('.show-password-btn').each(function() {
        $(this).on('mousedown', () => {
            $(this).prev()[0].type = "text";
            $(this).html('<i class="fa fa-eye-slash" aria-hidden="true"></i>')
        })
        $(this).on('mouseup', () => {
            $(this).prev()[0].type = "password";
            $(this).html('<i class="fa fa-eye" aria-hidden="true"></i>')
        })
    })
})

//////////////////////////////////////////////
// This function adds and removes the hidden class from the developer token input
//////////////////////////////////////////////
$(function() {
    $("#form-register-role").change(function() {

        if ($("#form-register-role option:selected").text() === "Admin") {
            $("#form-admin-token").removeClass("hidden");
        } else {
            $("#form-admin-token").addClass("hidden");
        }
    })
})

//////////////////////////////////////////////
// Get request for question feed from server
//////////////////////////////////////////////

$(() => {
    const url = '/api/server-status/get-question-feeds';
    fetch(url, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    }).then(function(res) {
        res.json().then((result) => {
            result.feeds.map((feed) => {
                const feedHtmlListElement = "<li><a href=\"#\" id=\"question-feed-content\">" + feed + "</a></li>";
                $('#question-feed-list').append(feedHtmlListElement);
            })

            // add click handler to each feed question
            addQuestionFeedClickEventHanlder();
        })
    }).catch(function(err) {
        generateNotice('error', err)
    });
})

//////////////////////////////////////////////
// ask-question-module function
//////////////////////////////////////////////

$(function() {
    if ($('#external_question').length) {
        const external_question = $('#external_question').text();
        $('#userQueryInput').val(external_question);
        $('#querySubmitBtn').click();
    }
})

// $(()=>{
//   $('#external-ask-bar-btn').on('click',()=>{
//     const question = $('#external-ask-bar-input').val();
//     const url = '/external-ask/'+question;
//     fetch(url, {
//         method: "GET",
//         credentials: 'include',
//          redirect: 'follow',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
//         }
//     }).catch((err)=>{
//       generateNotice('error', err);
//     })
//   })
// })

var checkDOM = function(ElementName) {
    if ($(ElementName)) {
        return true;
    } else {
        console.log("DOM element : " + ElementName + "does not exists.");
        return false;
    }
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

/////////////////////////////////////////////////////////////////////////////////////////
//Event handlers for developer manage question and answer in console (admin.ejs)
/////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function() {

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
            } else {
                $.ajax({url: '/postQuestionAnswer', type: 'post', data: queryData}).done(function(data) {
                    if (data.status === "1") { //call Noty with message for success
                        generateNotice('success', "<div><i class=\"fa fa-check\" aria-hidden=\"true\"></i> " + data.message + "</div>");
                        questionContext.val(""); //clear text input
                        answerContext.val("");
                        tagContext.val("");
                    } else {
                        //err
                        if (data.status === "0") { //call Noty with message for alert
                            generateNotice('alert', "<div><i class=\"fa fa-exclamation\" aria-hidden=\"true\"></i> " + data.message + "</div>");
                        }
                        if (data.status === "-1") { //call Noty with message for error
                            generateNotice('error', "<div><i class=\"fa fa-times\" aria-hidden=\"true\"></i> " + data.message + "</div>");
                        }
                    }
                });
            }
        })
    }

})

//////////////////////////////////////////////
// Question feeds click event handler
//////////////////////////////////////////////

const addQuestionFeedClickEventHanlder = () => {
    $('#question-feed-list li a').each(function() {
        $(this).on('click', function(evt) {
            evt.preventDefault();
            // grab question text and put in to search bar
            $('#userQueryInput').val($(this).text())

            // mannual fire search event by click the submit button
            $('#querySubmitBtn').click();
        })
    })
};

//////////////////////////////////////////////
// Answer related question ask event handler
//////////////////////////////////////////////

const addAnswerRelatedQuestionHandler = ()=>{
  $('.answer-relate-question').each(function() {
      $(this).on('click', function(evt) {
          evt.preventDefault();
          // grab question text and put in to search bar
          $('#userQueryInput').val($(this).text())

          // mannual fire search event by click the submit button
          $('#querySubmitBtn').click();
      })
  })
}

//////////////////////////////////////////////
// String utility
//////////////////////////////////////////////

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//////////////////////////////////////////////////
// answer text flag(tag) extraction and formation
//////////////////////////////////////////////////

const formatAnswerByTag = (input) => {

    //for [\n]
    const endLineRegularExpression = /(\[\\n\])/g;

    input = input.replace(endLineRegularExpression, '</br>');

    //for [html]...[/html]
    if (input.match("\\[html\\].*?\\[/html\\]")) {

        //[html] to <div class="answerHTMLDOM">
        input = input.replace(new RegExp("\\[html\\]", "g"), "<div class=\"answerHTMLDOM\">");

        //[/html] to </div>
        input = input.replace(new RegExp("\\[/html\\]", "g"), "</div><p class=\"answer-body\">");

    }

    // hide [ask]...[/ask]

    if (input.match("\\[ask\\].*?\\[/ask\\]")) {

        input = input.replace(new RegExp("\\[ask\\].*?\\[/ask\\]", "g"), "");
    }

    // for [a]...[/a] and [link]...[/link] pair

    const linkRegularExpression = /(\[link\].*?\[\/link\])/gi; // reg pattern for [link]...[/link]

    let linkAry = input.match(linkRegularExpression); // search answer if there is any [link]...[/link], if there is one or more, each segement will be assign to an array

    if (linkAry && linkAry.length > 0) { // if array contains any [link]...[/link]
        input = input.replace(linkRegularExpression, "") // trim [link]...[/link] from original answer

        // trim [link] and [/link] from each segement in array
        linkAry = linkAry.map((link) => {
            link = link.replace(new RegExp("\\[link\\]"), "");
            link = link.replace(new RegExp("\\[\/link\\]"), "");
            link = link.replace(new RegExp("\\s", "g"), "");
            return link;
        })

        let anchorCount = 0;
        const anchorRegularExpression = /\[a\].*?\[\/a\]/; // reg pattern for [a]...[/a]
        while (input.match(anchorRegularExpression) && input.match(anchorRegularExpression).length > 0) { // check each [a]...[/a] in the original answer

            // convert to <a target="_blank" href="...">...</a>
            input = input.replace(new RegExp("\\[a\\]"), "<a target=\"_blank\" href=\"" + linkAry[anchorCount] + "\">");
            input = input.replace(new RegExp("\\[\/a\\]"), "</a>");
            anchorCount++;
        }
    }

    // for [question]...[/question]

    if (input.match("\\[question\\].*?\\[/question\\]")) {
        // convert to general question that can be directly asked to system

    }

    // for [ul][li]...[/li][/ul]
    if (input.match("\\[ul\\].*?\\[/ul\\]")) {
        // convert to general question that can be directly asked to system
        input = input.replace(new RegExp("\\[ul\\]", "g"), "<ul>");
        input = input.replace(new RegExp("\\[\/ul\\]", "g"), "</ul>");
        input = input.replace(new RegExp("\\[li\\]", "g"), "<li>");
        input = input.replace(new RegExp("\\[\/li\\]", "g"), "</li>");
    }

    // for [question][/question]
    if (input.match("\\[question\\].*?\\[/question\\]")) {
        // convert to general question that can be directly asked to system
        input = input.replace(new RegExp("\\[question\\]", "g"), "<a href=\"#\" class=\"answer-relate-question\">");
        input = input.replace(new RegExp("\\[\/question\\]", "g"), "</a>");
        // handler are in
    }

    //for [extend]...[/extend] same step above but replace to
    //<span class="extend-btn">Read More</span><div class="extend-hide">...<div>
    if (input.match("\\[extend\\].*?\\[/extend\\]")) {

        let extendText = input.match("\\[extend\\].*?\\[/extend\\]").toString();

        extendText = extendText.replace(new RegExp("\\[extend\\]", "g"), "");

        extendText = extendText.replace(new RegExp("\\[/extend\\]", "g"), "");

        input = input.replace(new RegExp("\\[extend\\].*?\\[/extend\\]", "g"), "<div><span class=\"read-more btn btn-secondary\">Read More</span><div class=\"answer-body hide\">" + extendText + "</div></div>");
    }

    return input;
}
