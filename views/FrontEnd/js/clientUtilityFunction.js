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
        dismissQueue: false,
        layout: 'topRight',
        closeWith: ['click'],
        theme: 'relax',
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
                returnl;
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
$(function() {
    $("#upload-Question-Text-File").dropzone({url: "/api/admin/upload/upload-by-text-file"});
});

//////////////////////////////////////////////////
// user like/fav question answer handler functions
//////////////////////////////////////////////////
var addLikeBtnHandler = function(answerSequenceNumber){
    $($('.answer-like-btn')[answerSequenceNumber]).on('click', function() {
      const targetAnswer = $('[data-answer-seq='+answerSequenceNumber+']').text();
      console.log(targetAnswer);
    });
};

//////////////////////////////////////////////////
// answer text flag extraction and formation
//////////////////////////////////////////////////
var formatText = function(inputText) {

    //for [html]...[html]
    if (inputText.match("\\[\\n\\]") || inputText.match("\\[\\\\n\\]")) {
        //replace original link segment with DOM rendable element
        inputText = inputText.replace(new RegExp("\\[\\n\\]", "g"), "</br>");
        inputText = inputText.replace(new RegExp("\\[\\\\n\\]", "g"), "</br>");
    }

    //for [html]...[html]
    if (inputText.match("\\[html\\].*?\\[html\\]")) { //if we find something like [html]...[html]

        //extract link
        var linkText = inputText.match("\\[html\\].*?\\[html\\]").toString(); //Now linkText will look like this [html]www.abc.com[/html]

        //trim [html] out of [html]www.abc.com[/html]
        linkText = linkText.replace(new RegExp("\\[html\\]", "g"), "");

        //trim [/html] out of www.abc.com[/html]
        linkText = linkText.replace(new RegExp("\\[html\\]", "g"), "");

        console.log("Extracted link : " + linkText);

        //replace original link segment with DOM rendable element
        inputText = inputText.replace(new RegExp("\\[html\\].*?\\[html\\]", "g"), "<p><a href='" + linkText + "' target='_blank'>Click me</a></p>");
    } else {
        console.log("No [html]...[html] in the text");
    }

    //for [link]...[link]
    if (inputText.match("\\[link\\].*?\\[link\\]")) { //if we find something like [html]...[/html]

        //extract link
        var linkText = inputText.match("\\[link\\].*?\\[link\\]").toString(); //Now linkText will look like this [html]www.abc.com[link]

        //trim [link] out of [link]www.abc.com[link]
        linkText = linkText.replace(new RegExp("\\[link\\]", "g"), "");

        console.log("Extracted link : " + linkText);

        //replace original link segment with DOM rendable element
        inputText = inputText.replace(new RegExp("\\[link\\].*?\\[link\\]", "g"), "<p><a href='" + linkText + "' target='_blank'>Click me</a></p>");
    } else {
        console.log("No [link]...[link] in the text");
    }

    //for [link]...[/link]
    if (inputText.match("\\[link\\].*?\\[/link\\]")) { //if we find something like [html]...[/html]

        //extract link
        var linkText = inputText.match("\\[link\\].*?\\[/link\\]").toString(); //Now linkText will look like this [html]www.abc.com[link]

        //trim [link] out of [link]www.abc.com[/link]
        linkText = linkText.replace(new RegExp("\\[link\\]", "g"), "");

        //trim [/link] out of www.abc.com[/link]
        linkText = linkText.replace(new RegExp("\\[/link\\]", "g"), "");
        console.log("Extracted link : " + linkText);

        //replace original link segment with DOM rendable element
        inputText = inputText.replace(new RegExp("\\[link\\].*?\\[/link\\]", "g"), "<p><a href='" + linkText + "' target='_blank'>Click me</a></p>");
    } else {
        console.log("No [link]...[/link] in the text");
    }

    //for [tip]...[/tip] same step above but replace to
    //<span class="tip">...</span>
    if (inputText.match("\\[tip\\].*?\\[/tip\\]")) { //if we find something like [tip]...[/tip]

        var tipText = inputText.match("\\[tip\\].*?\\[/tip\\]").toString(); //Now linkText will look like this

        tipText = tipText.replace(new RegExp("\\[tip\\]", "g"), "");

        tipText = tipText.replace(new RegExp("\\[/tip\\]", "g"), "");

        console.log("Extracted tip : " + tipText);

        inputText = inputText.replace(new RegExp("\\[tip\\].*?\\[/tip\\]", "g"), "<span class=\"tip\">" + tipText + "</span>");
    } else {
        console.log("No [tip]...[/tip] in the text");
    }

    //for [keyword]...[keyword] same step above but replace to
    //<span class="tip">...</span>
    if (inputText.match("\\[keyword\\].*?\\[keyword\\]")) { //if we find something like [tip]...[/tip]

        var keywordText = inputText.match("\\[keyword\\].*?\\[keyword\\]").toString(); //Now linkText will look like this

        keywordText = keywordText.replace(new RegExp("\\[keyword\\]", "g"), "");

        console.log("Extracted tip : " + keywordText);

        inputText = inputText.replace(new RegExp("\\[keyword\\].*?\\[keyword\\]", "g"), "<p><span class=\"tip\">Suggest: " + keywordText.capitalize() + " Service</span></p>");
    } else {
        console.log("No [keyword]...[keyword] in the text");
    }

    //for [extend]...[/extend] same step above but replace to
    //<span class="extend-btn">Read More</span><div class="extend-hide">...<div>
    if (inputText.match("\\[extend\\].*?\\[/extend\\]")) { //if we find something like [extend]...[/extend]

        var extendText = inputText.match("\\[extend\\].*?\\[/extend\\]").toString(); //Now linkText will look like this

        extendText = extendText.replace(new RegExp("\\[extend\\]", "g"), "");

        extendText = extendText.replace(new RegExp("\\[/extend\\]", "g"), "");

        console.log("Extracted extend : " + extendText);

        inputText = inputText.replace(new RegExp("\\[extend\\].*?\\[/extend\\]", "g"), "<div class=\"read-more\">Read More</div><div class=\"extend-hide\"><p class=\"answer\">" + extendText + "</p></div>");
    } else {
        console.log("No [extend]...[/extend] in the text");
    }

    console.log("Formatted text: " + inputText);
    //return formatted text
    return inputText;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.formatAnswerByTag = function() {}
