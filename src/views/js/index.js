'use strict'

let data = ["test1", "test2", "test3", "test4"];

$(document).ready(function () {
    // when user presses the send button
    $('#send').click(function () {
        addUserChat();
    });

    // allows user to just press enter
    $('#question').keypress(function (e) {
        if (e.which == 13) {
            addUserChat();
            return false; //So that page doesn't refresh
        }
    });

    // Update the first Watson message
    $("#Watson-Time").html('Watson | ' + getDateAndTime());

    //$('#myModal').modal('toggle');
});

// when the user wants to see more answers, they can click on the buttons
// this makes sure that the data is changed
$(document).on('click', ':button', function (e) {
    $('.active').removeClass('active')
    $(this).addClass('active');
    $('.media-watson-info').html(data[this.id]);
    addReadmoreHandler();
    $('.current-chat-area').scrollTop($('.current-chat-area')[0].scrollHeight);
    e.preventDefault();
});

// formats date and time
function getDateAndTime() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var time;

    if (minutes < 10)
        minutes = '0' + minutes;

    if (hour > 12)
        time = hour - 12 + ':' + minutes + ' pm';
    else
        time = hour + ':' + minutes + ' am';

    month = months[month];

    // Formatting the date
    if (day == 1 || day == 21)
        day = day + 'st';
    else if (day == 2 || day == 22)
        day = day + 'nd';
    else if (day == 3 || day == 23)
        day = day + 'rd';
    else
        day = day + 'th';

    return day + ' of ' + month + ' at ' + time;
}


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
  while (input.match("\\[extend\\].*?\\[/extend\\]")) {

    let initExtendText = input.match("\\[extend\\].*?\\[/extend\\]").toString();

    let extendText = initExtendText.replace(new RegExp("\\[extend\\]", "g"), "");

    extendText = extendText.replace(new RegExp("\\[/extend\\]", "g"), "");

    input = input.replace(initExtendText, "<div><span class=\"read-more btn btn-secondary\">Read More</span><div class=\"answer-body hide\">" + extendText + "</div></div>");
  }

  while (input.match("\\[tip\\].*?\\[/tip\\]")) {
    let initTipText = input.match("\\[tip\\].*?\\[/tip\\]").toString();

    let tipText = initTipText.replace(new RegExp("\\[tip\\]", "g"), "");

    tipText = tipText.replace(new RegExp("\\[/tip\\]", "g"), "");

    tipText = "</br></br><i>Tip: " + tipText + "</i>";

    input = input.replace(initTipText, tipText);
  }

  while (input.match("\\[img\\].*?\\[/img\\]")) {
    let initImgText = input.match("\\[img\\].*?\\[/img\\]").toString();

    let imgSrc = initImgText.replace(new RegExp("\\[img\\]", "g"), "").replace(new RegExp("\\[/img\\]", "g"), "");

    imgDomStr = "</br><img src=\"" + imgSrc + "\"></br>";

    input = input.replace(initImgText, imgDomStr);
  }

  return input;
}

// Just to condense the append functions
// it's to make sure all of the messages stay consistant
let htmlBefore = '<li class="media"><div class="media-body row"><div class="pull-right"><img class="media-object img-circle " src="images/default-user.png"></div><div class="media-user-info">';
let htmlWBefore = '<li class="media"><div class="media-body row"><div class="pull-left"><img class="media-object img-circle " src="images/logo.png"></div><div class="media-watson-info">';
let watsonChatClassNumerous = '<p class="media-text current-message">';
let watsonChatClassSingle = '<p class="media-text">';
let htmlAfter = '</small></div></div></div></li>';
let htmlButtons = '<div class="btn-group other-answers" role="group" aria-label="...">' +
    '<button type="button" class="btn btn-default active" id="0">First</button>' +
    '<button type="button" class="btn btn-default" id="1">Second</button>' +
    '<button type="button" class="btn btn-default" id="2">Third</button>' +
    '<button type="button" class="btn btn-default" id="3">Fourth</button></div>';
let htmlWAfter = '</small></div></div></div>' + htmlButtons + '</li>';
let htmlWAfterNoButtons = '</small></div></div></div></li>';

// This adds the user input to the chat and sends it to server for response
function addUserChat() {
    let question = {};
    question.title = $('#question').val();
    let date = getDateAndTime();

    // Regex checks if the string sent isn't only spaces
    if (/\S/.test(question.title)) {
        $('#chat').append(htmlBefore + question.title + '<br><small class="text-muted">You | ' + getDateAndTime() + htmlAfter);

        sendServerQuestion(question.title);
        //test();

        $('.current-chat-area').animate({ scrollTop: $(".scroll-chat").height() });
    }
    // Clears value in input field
    $('#question').val('');
}

function test() {
    data[0] = 'This is just a test';


}

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
                  $('.current-chat-area').scrollTop($('.current-chat-area')[0].scrollHeight);
    })
  })
}

function sendServerQuestion(question) {
    fetch("/questions/send-lite", {
        method: 'post',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            'question': question,
            'context': {}
        })
    }).then(response => { return response.json() })
        .then(json => {
            $('.current-message').attr('class', 'media-text');
            $('.other-answers').remove();

            let i = 0;
            while (i < 4 && i != json.response.docs.length) {
                data[i] = formatAnswerByTag(json.response.docs[i].body);
                i++;
            }

            // don't want the buttons popping up if there is only one response from the server
            if (json.response.docs.length == 1) {
                 $('#chat').append(htmlWBefore + watsonChatClassSingle + data[0] + '</p><small class="text-muted">Watson | ' + getDateAndTime() + htmlWAfterNoButtons);
            }
            else {
                $('#chat').append(htmlWBefore + watsonChatClassNumerous + data[0] + '</p><small class="text-muted">Watson | ' + getDateAndTime() + htmlWAfter);
            }
            addReadmoreHandler();
            $('.current-chat-area').animate({ scrollTop: $(".scroll-chat").height() });
        });
}

