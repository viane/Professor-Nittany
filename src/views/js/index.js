'use strict'

let context = {};
let data = ["test1", "test2", "test3", "test4"];
let timeAsked = "";
let question = {};
let access_token;

$(() => {
  initMsgTimeElaspeListener();
  externalQuestionListener();
  lightbox.option({
    'resizeDuration': 200,
    'wrapAround': true
  });
})

$(document).ready(function() {
  // when user presses the send button
  $('#send').click(function() {
    addUserChat();
  });

  // allows user to just press enter
  $('#question').keypress(function(e) {
    if (e.which == 13) {
      addUserChat();
      return false; //So that page doesn't refresh
    }
  });

  // Update the first Watson message
  $("#Watson-Time").html('Watson | ' +
    '<span class="message-time" data-time-iso="' + moment().format() + '">' + moment().format("dddd, h:mm a") + '</span>');

  if (window.devicePixelRatio > 1)
    $("body").addClass("disable-zoom")

//$('#myModal').modal('toggle');
});

// when the user wants to see more answers, they can click on the buttons
// this makes sure that the data is changed
$(document).on('click', '.btn-default', function(e) {
  $('.active').removeClass('active')
  $(this).addClass('active');
  //let replaceHTML = watsonChatClassNumerous + data[this.id] + '</p><small class="text-muted">Watson | ' + timeAsked;
  e.preventDefault();
});

$(document).on('click', '.btn-log', function(e) {
  $(this).prop("disabled", true);
  logQuestion(question.title);
  e.preventDefault();
});


$(document).on('click', '.btn-answer', function(e) {
  $('.current-message').empty();
  $('.current-message').html(data[this.id]);
  initProgressHandler($($('.progress-section')[$('.progress-section').length - 1]));
  addReadmoreHandler();
  $('.current-chat-area').scrollTop($('.current-chat-area')[0].scrollHeight);
  e.preventDefault();
});

$(document).on('click', '.question-tab', function(e) {
  if ($('.low-confidence').text() == "Check Unsatisfying Questions") {
    $('.lite-header').empty();
    $('.lite-header').text('Unsatisfying Questions');
    $('.current-chat-area').hide();
    $('.low-confidence').empty();
    $('.low-confidence').text('Lite Version');
    showLowQuestions();
  } else {
    $('.low-confidence').empty();
    $('.low-confidence').text('Check Unsatisfying Questions');
    $('.lite-header').empty();
    $('.lite-header').text('Lite Version');
    $('.current-chat-area').show();
    $('.logged-questions').remove();
  }

  e.preventDefault();
});

// formats date and time
function getDateAndTime() {
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth();
  var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
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
  while (input.match("\\[html\\].*?\\[/html\\]")) {

    //[html] to <div class="answerHTMLDOM">
    input = input.replace(new RegExp("\\[html\\]", "g"), "<div class=\"answerHTMLDOM\">");

    //[/html] to </div>
    input = input.replace(new RegExp("\\[/html\\]", "g"), "</div><p class=\"answer-body\">");

  }

  // hide [ask]...[/ask]

  while (input.match("\\[ask\\].*?\\[/ask\\]")) {

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
      input = input.replace(new RegExp("\\[a\\]"), "<a class=\"effect-shine\" target=\"_blank\" href=\"" + linkAry[anchorCount] + "\">");
      input = input.replace(new RegExp("\\[\/a\\]"), "</a>");
      anchorCount++;
    }
  }

  // for [a]...[/a] and [email-addr]...[/email-addr] pair

  const emailRegularExpression = /(\[email-addr\].*?\[\/email-addr\])/gi; // reg pattern for [email-addr]...[/email-addr]

  let emailAry = input.match(emailRegularExpression); // search answer if there is any [email-addr]...[/email-addr], if there is one or more, each segement will be assign to an array

  if (emailAry && emailAry.length > 0) { // if array contains any [email-addr]...[/email-addr]

    // trim [link] and [/link] from each segement in array
    emailAry = emailAry.map((email) => {
      email = email.replace(new RegExp("\\[email-addr\\]"), "");
      email = email.replace(new RegExp("\\[\/email-addr\\]"), "");
      email = email.replace(new RegExp("\\s", "g"), "");
      return email;
    })

    let anchorCount = 0;
    const anchorRegularExpression = /\[email-addr\].*?\[\/email-addr\]/; // reg pattern for [a]...[/a]
    while (input.match(anchorRegularExpression) && input.match(anchorRegularExpression).length > 0) { // check each [a]...[/a] in the original answer

      // convert to <a target="_blank" href="...">...</a>
      input = input.replace(new RegExp("\\[email-addr\\]"), "<a class=\"effect-shine\" target=\"_blank\" href=\"mailto:" + emailAry[anchorCount] + "\">");
      input = input.replace(new RegExp("\\[\/email-addr\\]"), "</a>");
      anchorCount++;
    }
  }

  const emailRegularExpression2 = /(\[email\].*?\[\/email\])/gi; // reg pattern for [email-addr]...[/email-addr]

  let emailAry2 = input.match(emailRegularExpression2); // search answer if there is any [email-addr]...[/email-addr], if there is one or more, each segement will be assign to an array

  if (emailAry2 && emailAry2.length > 0) { // if array contains any [email-addr]...[/email-addr]

    // trim [link] and [/link] from each segement in array
    emailAry2 = emailAry2.map((email) => {
      email = email.replace(new RegExp("\\[email\\]"), "");
      email = email.replace(new RegExp("\\[\/email\\]"), "");
      email = email.replace(new RegExp("\\s", "g"), "");
      return email;
    })

    let anchorCount2 = 0;
    const anchorRegularExpression2 = /\[email\].*?\[\/email\]/; // reg pattern for [a]...[/a]
    while (input.match(anchorRegularExpression2) && input.match(anchorRegularExpression2).length > 0) { // check each [a]...[/a] in the original answer

      // convert to <a target="_blank" href="...">...</a>
      input = input.replace(new RegExp("\\[email\\]"), "<a class=\"effect-shine\" target=\"_blank\" href=\"mailto:" + emailAry[anchorCount2] + "\">");
      input = input.replace(new RegExp("\\[\/email\\]"), "</a>");
      anchorCount2++;
    }
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

  // for [tip] ... [/tip]
  while (input.match("\\[tip\\].*?\\[/tip\\]")) {
    let initTipText = input.match("\\[tip\\].*?\\[/tip\\]").toString();

    let tipText = initTipText.replace(new RegExp("\\[tip\\]", "g"), "");

    tipText = tipText.replace(new RegExp("\\[/tip\\]", "g"), "");

    tipText = "</br></br><i>Tip: " + tipText + "</i>";

    input = input.replace(initTipText, tipText);
  }

  // for [optional] ... [/optional]
  while (input.match("\\[optional\\].*?\\[/optional\\]")) {
    let initOptionalText = input.match("\\[optional\\].*?\\[/optional\\]").toString();

    let optionalText = initOptionalText.replace(new RegExp("\\[optional\\]", "g"), "");

    optionalText = optionalText.replace(new RegExp("\\[/optional\\]", "g"), "");

    optionalText = "<span class='optional-text'><i class='fa fa-tags' aria-hidden='true'></i> " + optionalText + "</span>";

    input = input.replace(initOptionalText, optionalText);
  }


  while (input.match("\\[img\\].*?\\[/img\\]")) {
    const initImgText = input.match("\\[img\\].*?\\[/img\\]").toString();

    let imgSrc = initImgText.replace(new RegExp("\\[img\\]", "g"), "").replace(new RegExp("\\[/img\\]", "g"), "").trim();

    // if lionpath tutorial img src
    if (imgSrc.match("^\/image\/.*?.png") != null) {
      imgSrc = imgSrc.replace(new RegExp("\/image\/", "g"), "/images/answer_image/");
    }
    const imgDomStr = "</br><a data-lightbox=\"image" + uuidv4() + "\" href=\"" + imgSrc + "\"><img class=\"step-image\" src=\"" + imgSrc + "\"></a></br>";

    input = input.replace(initImgText, imgDomStr);
  }

  while (input.match("\\[progress\\].*?\\[/progress\\]")) {
    // convert to general question that can be directly asked to system
    let initProgressText = input.match("\\[progress\\].*?\\[/progress\\]").toString();
    const totalStepNumber = (initProgressText.match(new RegExp("\\[step\\]", "g") || [])).length;
    const progressDivStart = "<div class=\"progress-section\" data-on-step=" + 1 + " data-total-step=" + totalStepNumber + ">"
    // previous step btn
    const pBtn = "<div class=\"previous-step-btn\"><i class=\"fa fa-chevron-left\" aria-hidden=\"true\"></i></div>";
    // next step btn
    const nBtn = "<div class=\"next-step-btn\"><i class=\"fa fa-chevron-right\" aria-hidden=\"true\"></i></div>";
    // add visual indicator
    let indicator = "";
    indicator += '<div class="progress-indicator">';
    indicator += '  <div class="circle">';
    indicator += '    <div class="mask full">';
    indicator += '      <div class="fill"></div>';
    indicator += '    </div>';
    indicator += '    <div class="mask half">';
    indicator += '      <div class="fill"></div>';
    indicator += '      <div class="fill fix"></div>';
    indicator += '    </div>';
    indicator += '  </div>';
    indicator += '  <div class="inset"><span class="current-step-number">1</span><span class="total-step-number">/' + totalStepNumber + '</span></div>';
    indicator += '</div>';
    // wraper for steps
    const stepContent = '<div class="step-content">';
    // convert progress tag
    // div.progress-section
    //  div.pbtn div.nbtn div.indicator div.step-content
    initProgressText = initProgressText.replace(new RegExp("\\[progress\\]", "g"), progressDivStart + '<div class="step-control">' + indicator + pBtn + nBtn + '</div>' + stepContent);
    initProgressText = initProgressText.replace(new RegExp("\\[\/progress\\]", "g"), "</div></div>");
    // convert step tag
    initProgressText = initProgressText.replace(new RegExp("\\[step\\]", "g"), "<div class=\"step\">");
    initProgressText = initProgressText.replace(new RegExp("\\[\/step\\]", "g"), "</div>");

    input = input.replace(input.match("\\[progress\\].*?\\[/progress\\]").toString(), initProgressText);
  }

  return input;
}

// Just to condense the append functions
// it's to make sure all of the messages stay consistant
let htmlBefore = '<li class="media"><div class="media-body row"><div class="pull-right"><img class="media-object img-circle " src="images/default-user.png"></div><div class="media-user-info">';
let htmlLBefore = '<li class="media loading"><div class="media-body row"><div class="pull-left"><img class="media-object img-circle " src="images/logo.png"></div><div class="media-watson-info loading-info">';
let htmlWBefore = '<li class="media"><div class="media-body row"><div class="pull-left"><img class="media-object img-circle " src="images/logo.png"></div><div class="media-watson-info active-chat">';
let watsonChatClassNumerous = '<div class="current-message"><p class="media-text">';
let watsonChatClassSingle = '<p class="media-text">';

let htmlAfter = '</span></div></div></div></li>';
let html2Buttons = '<p class="media-text">View a different answer by clicking a button below.</p><div class="btn-group other-answers" role="group" aria-label="...">' + '<div type="button" class="btn btn-default btn-answer active" id="0">First</div>' + '<div type="button" class="btn btn-default btn-answer" id="1">Second</div>' + '<div type="buttion" class="btn btn-danger btn-log pull-right">No Satisfying Answers</div>';
let html3Buttons = '<p class="media-text">View a different answer by clicking a button below.</p><div class="btn-group other-answers" role="group" aria-label="...">' + '<div type="button" class="btn btn-default btn-answer active" id="0">First</div>' + '<div type="button" class="btn btn-default btn-answer" id="1">Second</div>' + '<div type="button" class="btn btn-default btn-answer" id="2">Third</div>' + '<div type="buttion" class="btn btn-danger btn-log pull-right">No Satisfying Answers</div>';
let html4Buttons = '<p class="media-text">View a different answer by clicking a button below.</p><div class="btn-group other-answers" role="group" aria-label="...">' + '<div type="button" class="btn btn-default btn-answer active" id="0">First</div>' + '<div type="button" class="btn btn-default btn-answer" id="1">Second</div>' + '<div type="button" class="btn btn-default btn-answer" id="2">Third</div>' + '<div type="button" class="btn btn-default btn-answer" id="3">Fourth</div></div>' + '<div type="buttion" class="btn btn-danger btn-log pull-right">No Satisfying Answers</div>';
let htmlWAfter = '</span></div></div></div></li>';
let htmlWAfterNoButtons = '</span></div></div></div></li>';

let htmlLAfter = '</div></div></li>'
let htmlLoading = '<div class="cs-loader"><label> ●</label><label> ●</label><label> ●</label></div>';

// This adds the user input to the chat and sends it to server for response
function addUserChat() {
  question.title = $('#question').val();
  let date = getDateAndTime();

  // Regex checks if the string sent isn't only spaces
  if (/\S/.test(question.title)) {
    $('#chat').append(htmlBefore + question.title + '<br><small class="text-muted">You | ' + '<span class="message-time" data-time-iso="' + moment().format() + '">' + moment().format("dddd, h:mm a") + '</span>' + htmlAfter);

    sendServerQuestion(question.title);

    $('.current-chat-area').animate({
      scrollTop: $(".scroll-chat").height() + 20 + 'px'
    });
  }
  // Clears value in input field
  $('#question').val('');
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
  $('#chat').append(htmlLBefore + htmlLoading + htmlLAfter);
  fetch("../questions/send-lite", {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      'question': question,
      'context': context
    })
  }).then(response => {
    return response.json()
  })
    .then(json => {
      // console.log(json);
      $('.loading').remove();
      $('.current-message').attr('class', 'media-text');
      $('.other-answers').remove();
      $('.btn-log').remove();
      $('.active-chat').removeClass('active-chat');
      let i = 0;
      while (i < 4 && i != json.response.docs.length) {
        data[i] = formatAnswerByTag(json.response.docs[i].body);
        i++;
      }
      context = json.context;
      // don't want the buttons popping up if there is only one response from the server
      timeAsked = '<span class="message-time" data-time-iso="' + moment().format() + '">' + moment().format("dddd, h:mm a") + '</span>';

      // I need the number of buttons to match the number of answers
      switch(json.response.docs.length) {
        case 1: 
          $('#chat').append(htmlWBefore + watsonChatClassSingle + data[0] + '</p><small class="text-muted">Watson | ' + timeAsked + htmlWAfterNoButtons); 
          break;
        case 2:
          $('#chat').append(htmlWBefore + watsonChatClassNumerous + data[0] + '</p></div><p>' + html2Buttons + '</p><small class="text-muted">Watson | ' + timeAsked + htmlWAfter);
          break;
        case 3:
          $('#chat').append(htmlWBefore + watsonChatClassNumerous + data[0] + '</p></div><p>' + html3Buttons + '</p><small class="text-muted">Watson | ' + timeAsked + htmlWAfter);
          break;
        default:
          $('#chat').append(htmlWBefore + watsonChatClassNumerous + data[0] + '</p></div><p>' + html4Buttons + '</p><small class="text-muted">Watson | ' + timeAsked + htmlWAfter);
          break;
      }

      initProgressHandler($($('.progress-section')[$('.progress-section').length - 1]));
      addReadmoreHandler();
      $('.current-chat-area').animate({
        scrollTop: $(".scroll-chat").height()
      });

      $('#question').val('');
    });
}

////////////////////////////////////
/// Answer progress handler
////////////////////////////////////
const initProgressHandler = (ele) => {
  updateStep(ele);
  updateProgressIndicator(ele);
  initPNBtnHandler(ele);
}

const updateStep = (ele) => {
  const currentStep = $(ele).data("on-step");
  $(ele).find('.step-content .step').hide();
  $($(ele).find('.step-content .step')[currentStep - 1]).show();
}

const updateProgressIndicator = (ele) => {
  const currentStep = $(ele).data("on-step");
  const totalStep = $(ele).data("total-step");
  $(ele).find('.current-step-number').text(currentStep);
  $(ele).find('.total-step-number').text('/' + totalStep);
  const score = currentStep;
  const transform_styles = ['-webkit-transform', '-ms-transform', 'transform'];
  $(ele).find('span').fadeTo('slow', 1);
  const deg = (((100 / totalStep) * score) / 100) * 180;
  const rotation = deg;
  const fill_rotation = rotation;
  const fix_rotation = rotation * 2;
  for (let i in transform_styles) {
    $(ele).find('.circle .fill, .circle .mask.full').css(transform_styles[i], 'rotate(' + fill_rotation + 'deg)');
    $(ele).find('.circle .fill.fix').css(transform_styles[i], 'rotate(' + fix_rotation + 'deg)');
  }
}

const initPNBtnHandler = (ele) => {
  $(ele).find('.previous-step-btn').on('click', () => {
    const currentStep = $(ele).data("on-step");
    if (currentStep > 1) {
      $(ele).data("on-step", currentStep - 1);
      updateProgressIndicator(ele);
      updateStep(ele);
    }
  });

  $(ele).find('.next-step-btn').on('click', () => {
    const currentStep = $(ele).data("on-step");
    const totalStep = $(ele).data("total-step");
    if (currentStep < totalStep) {
      $(ele).data("on-step", currentStep + 1);
      updateProgressIndicator(ele);
      updateStep(ele);
    }
  });
}

// update message elaspe handler
const initMsgTimeElaspeListener = () => {
  updateTime();
}

const updateTime = () => {
  const randTime = Math.round(Math.random() * (60000 - 10000)) + 10000;
  setTimeout(function() {
    // update display time
    $('.message-time').each((index, ele) => {
      const orginalTimeISO = $(ele).data('time-iso');
      $(ele).html(moment(orginalTimeISO).fromNow());
    })
    // call next
    updateTime();
  }, randTime);
}

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

const externalQuestionListener = () => {
  if (window.location.pathname == '/lite-version.html') {
    const url = new URL(window.location.href);
    window.history.pushState("object or string", "Title", "/" + window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]);
    const externalQuestionString = url.searchParams.get("q");
    if (externalQuestionString != null && externalQuestionString.length > 0 && externalQuestionString.trim() != "") {
      $('#question').val(externalQuestionString.trim());
      setTimeout(() => {
        $('.fa-paper-plane-o').click();
      }, 10)
    }
  }
}

//log unsatisfying answers to a question
function logQuestion(question) {
  fetch("../questions/log-question", {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({
      'question': question,
      'answers': data
    })
  }).then(response => {
    return response.json()
  })
    .then(json => {
      $('.btn-log').empty();
      $('.btn-log').text(json.message);
      $('.btn-log').addClass('active');
    });
}

function questionWrapper(question) {
  var questionHTML = '';
  var questionListHTMLH = '<div class="panel-group scrollable logged-questions" id="accordion" role="tablist" aria-multiselectable="true">';
  var questionListHTMLT = '</div>';
  for (let i = 0; i < question.length; i++) {
    questionHTML = questionHTML + '<div class="panel panel-default">';
    questionHTML = questionHTML + '<div class="panel-heading" role="tab" id="headingOne">'
    questionHTML = questionHTML + '<h3 class="panel-title">'
    questionHTML = questionHTML + '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '" aria-expanded="true" aria-controls="collapseOne">';
    questionHTML = questionHTML + question[i].body;
    questionHTML = questionHTML + '</a>'
    questionHTML = questionHTML + '</h3>'
    questionHTML = questionHTML + '</div>'
    questionHTML = questionHTML + '<div id="collapse' + i + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">'
    questionHTML = questionHTML + '<div class="panel-body logged-answers">'
    for (let j = 0; j < question[i].temp_answer_holder.length; j++) {
      questionHTML = questionHTML + "<h4>Answer " + (j + 1) + " </h4>" + question[i].temp_answer_holder[j];
    }
    questionHTML = questionHTML + '</div>';
    questionHTML = questionHTML + '</div>';
    questionHTML = questionHTML + '</div>';
  }
  return questionListHTMLH + questionHTML + questionListHTMLT;
// var questionListHTMLH = '<div class="row form-check scrollable">';
// var questionListHTMLT ='</div>';
// var questionInputH = '<p><label class="form-check-label"><input class="form-check-input" type="checkbox" value=';//"">';
// var questionInputT = '</label></p>';
// var accumulater='';
// if(question.length>0){
//   for(let i=0; i<question.length; i++){
//       accumulater= accumulater+questionInputH+'"'+i+'">'+question[i].body+questionInputT;
//       console.log(accumulater);
//   }
// }
// return questionListHTMLH + accumulater + questionListHTMLT;
}

function showLowQuestions() {
  $('.current-chat').append('<div class="question-loading scrollable">' + htmlLoading + '</div>');
  fetch("../questions/get-low-confidence", {
    method: 'get',
    headers: {
      "Content-type": "application/json",
      "x-access-token": access_token
    }
  }).then(response => {
    return response.json()
  })
    .then(json => {
      setTimeout(function() {
        $('.question-loading').remove()
      }, 2000);
      //console.log(json);
      var questionList = questionWrapper(json);
      $('.current-chat').append(questionList);
      initProgressHandler($($('.progress-section')[$('.progress-section').length - 1]));
      addReadmoreHandler();
    })

}
