'use strict'

const pageClass = ['.current-chat-area', '.profile-area', '.logged-questions', '.sample-question-container', 'ai-status-container'];
const pageTitle = ['Chatting with Prof.Nittany', 'Profile', 'Unsatisfying Question Console', 'Suggested Question Areas', 'AI Status'];

if (!localStorage.hasOwnProperty('iaa-userToken')) {
  localStorage.setItem('iaa-userToken', JSON.stringify("null"));
}

// password hint
(function($) {

  // Create plugin
  $.fn.tooltips = function(el) {

    var $tooltip,
      $body = $('body'),
      $el;

    // Ensure chaining works
    return this.each(function(i, el) {

      $el = $(el).attr("data-tooltip", i);
      var temp = '<div id="pswd_info">';
      temp = temp + '<h4>Password must meet the following requirements:</h4>';
      temp = temp + '<ul>';
      temp = temp + '<li class="invalid lowercase">At least <strong><span class="amount">1</span> character</strong></li>';
      temp = temp + '<li class="invalid uppercase">At least <strong><span class="amount">1</span> upper case character</strong></li>';
      temp = temp + '<li class="invalid numbers">At least <strong><span class="amount">1</span> number</strong></li>';
      temp = temp + '<li class="invalid specialchars">No <strong> special character</strong></li>';
      temp = temp + '</ul>';
      temp = temp + '</div>';

      // Make DIV and append to page
      var $tooltip = $('<div class="tooltip" data-tooltip="' + i + '">' + temp + '<div class="arrow"></div></div>').appendTo("body");

      // Position right away, so first appearance is smooth
      var linkPosition = $el.offset();

      $tooltip.css({
        top: linkPosition.top - $tooltip.outerHeight() - 13,
        left: linkPosition.left - ($tooltip.width() / 2) + ($el.width() / 2)
      });

      $el
      // Get rid of yellow box popup
        .removeAttr("title")
      // Mouseenter
        .focus(function() {

        $el = $(this);

        $tooltip = $('div[data-tooltip=' + $el.data('tooltip') + ']');

        // Reposition tooltip, in case of page movement e.g. screen resize
        var linkPosition = $el.offset();

        $tooltip.css({
          top: linkPosition.top - $tooltip.outerHeight() - 13,
          left: linkPosition.left - ($tooltip.width() / 2) + ($el.width() / 2)
        });

        // Adding class handles animation through CSS
        $tooltip.addClass("active");

        // Mouseleave
      }).focusout(function() {

        $el = $(this);

        // Temporary class for same-direction fadeout
        $tooltip = $('div[data-tooltip=' + $el.data('tooltip') + ']').addClass("out");

        // Remove all classes
        setTimeout(function() {
          $tooltip.removeClass("active").removeClass("out");
        }, 300);

      });

    });

  }

})(jQuery);

$(() => {
  // alpha test notification
  $.notify("You are in the alpha test version,\nsmall but unharmed bugs are expected in this stage.", {
    className: "info",
    clickToHide: true,
    autoHide: false
  });
  initGetSampleQuestion();
  initMsgTimeElaspeListener();
  externalQuestionListener();
  lightbox.option({'resizeDuration': 200, 'wrapAround': true});
  initUserAccountListener();
  initBtnHandler();
  initBornTime();
  initAnswerVideoSizeFitOnResize();
  $('.password').tooltips();
})

$(document).ready(function() {
  // when user presses the send button
  $('#send').click(function() {
    addUserChat();
  });

  // allows user to just press enter
  $(document).keypress(function(e) {
    if (e.which == 13) {
      $('#send').click();
      return false; //So that page doesn't refresh
    }
  });

  // Update the first Watson message
  $("#Watson-Time").html('Powered by <span class="watson-power-tag"><img class="small-chat-bubble-icon" src="images/watson-icon.png" /> Watson</span> | ' +
    '<span class="message-time" data-time-iso="' + moment().format() + '">' + moment().format("dddd, h:mm a") + '</span>');

  if (window.devicePixelRatio > 1)
    $("body").addClass("disable-zoom");

  fetch("/major-list", {
    method: 'get',
    headers: {
      "Content-type": "application/json"
    }
  }).then(response => {
    return response.json()
  }).then(json => {
    $.each(json, function(i, item) {
      $('#major').append($('<option>', {
        value: item._id,
        text: item.degree_name
      }));
    });
  })

  // mannual start tutorial
  $('#lite-instruction').click(() => {
    setLocalTourBool(false);
    $('#overlay').fadeIn(300);
    initTourFirstPart();
    $("[data-tour-step=1]").addClass('expose');
    displayTourFirstPart();
  })
});

// when the user wants to see more answers, they can click on the buttons
// this makes sure that the data is changed
$(document).on('click', '.btn-default', function(e) {
  $('.active').removeClass('active')
  $(this).addClass('active');
  e.preventDefault();
});

$(document).on('click', '.suggest-question-element', function(e) {
  $('#question').val($(this).text().trim());
  $('.btn-sample-question').click();
  $('#send').click();
  e.preventDefault();
})

$(document).on('click', '.btn-log', function(e) {
  $(this).prop("disabled", true);
  const questionBody = $(this).data('question-body');
  logQuestion(questionBody);
  e.preventDefault();
});

//rework, bug, fix
$(document).on('click', '.answer-switch-btn', function(e) {
  const answerIndex = $(this).data('answer-btn');
  //change btns looking
  $(this).html('<i class="fa fa-circle" aria-hidden="true"></i>');
  $(this).siblings().html('<i class="fa fa-circle-o" aria-hidden="true"></i>');
  //hide all answer
  $(this).parent().parent().find('.answer-content-wrapper.media-text').hide();
  //show target answer
  $(this).parent().parent().find('.answer-content-wrapper[data-answer-content="' + answerIndex + '"]').show();
  //$($(this).parent().parent().find('.step')[0]).show();
  initProgressHandler();
  addReadmoreHandler();
  $('.current-chat-area').scrollTop($('.current-chat-area')[0].scrollHeight);
  e.preventDefault();
});

// $(document).on('click', '.previous-step-btn, .next-step-btn', function(e) {
//   $('.current-chat-area').scrollTop($('.current-chat-area')[0].scrollHeight);
// });

// sample question btn
$(document).on('click', '.question-tab', function(e) {
  if ($('.low-confidence').text().trim() == "Unsatisfying Questions") {
    hideAllPage();
    showLowQuestions();
    $('.low-confidence').html('<i class="fa fa-chevron-left" aria-hidden="true"></i> Back to Chat')
  } else {
    $('.low-confidence').text("Unsatisfying Questions");
    hideAllPage();
    showPage('.current-chat-area');
    $('.logged-questions').remove();
  }
  e.preventDefault();
});

// AI status switch btn
$(document).on('click', '.server-status', function(e) {
  if ($('.server-status').text().trim() == "AI Learning Satus") {
    hideAllPage();
    showAIStatus();
    $('.ai-status-tab').html('<i class="fa fa-chevron-left" aria-hidden="true"></i> Back to Chat')
  } else {
    $('.ai-status-tab').text("AI Learning Satus");
    hideAllPage();
    showPage('.current-chat-area');
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

// answer formatter
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
      input = input.replace(new RegExp("\\[a\\]"), "<a class=\"effect-shine\" target=\"_blank\" href=\"" + linkAry[anchorCount] + "\"><i class=\"fa fa-link\" aria-hidden=\"true\"></i> ");
      input = input.replace(new RegExp("\\[\/a\\]"), "</a>");
      anchorCount++;
    }
  }

  // for [a]...[/a] and [email-addr]...[/email-addr] pair
  // extract email address
  const emailRegularExpression = /(\[email-addr\].*?\[\/email-addr\])/gi; // reg pattern for [email-addr]...[/email-addr]
  let emailAry = input.match(emailRegularExpression); // search answer if there is any [email-addr]...[/email-addr], if there is one or more, each segement will be assign to an array

  if (emailAry && emailAry.length > 0) { // if array contains any [email-addr]...[/email-addr]
    emailAry = emailAry.map((email) => {
      email = email.replace(new RegExp("\\[email-addr\\]"), "");
      email = email.replace(new RegExp("\\[\/email-addr\\]"), "");
      email = email.replace(new RegExp("\\s", "g"), "");
      return email;
    })

    const anchorRegularExpression = /\[email-addr\].*?\[\/email-addr\]/;
    while (input.match(anchorRegularExpression) && input.match(anchorRegularExpression).length > 0) { // remove [email-addr]...[/email-addr]
      input = input.replace(new RegExp("\\[email-addr\\].*?\\[\/email-addr\\]"), "");
    }

    // replace with DOM ele
    const emailRegularExpression2 = /(\[email\].*?\[\/email\])/gi; // reg pattern for [email]...[/email]

    let anchorCount = 0;
    while (input.match(emailRegularExpression2) && input.match(emailRegularExpression2).length > 0) { // check each [email]...[/email] in the original answer
      // convert to <a target="_blank" href="...">...</a>
      input = input.replace(new RegExp("\\[email\\]"), "<a class=\"effect-shine\" target=\"_blank\" href=\"mailto:" + emailAry[anchorCount] + "\">");
      input = input.replace(new RegExp("\\[\/email\\]"), "</a>");
      anchorCount++;
    }
  }

  // for [ul][li]...[/li][/ul]
  if (input.match("\\[ul\\].*?\\[/ul\\]")) {
    // convert to general question that can be directly asked to system
    input = input.replace(new RegExp("\\[ul\\]", "g"), '<ul class="answer-list">');
    input = input.replace(new RegExp("\\[\/ul\\]", "g"), "</ul>");
    input = input.replace(new RegExp("\\[li\\]", "g"), '<li  class="list-group-item answer-list-item">');
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

    input = input.replace(initExtendText, "<div class=\"answer-extra-info\"><div class=\"answer-body\" style=\"display:none\">" + extendText + "</div><span class=\"read-more next\">Read More</span></div>");
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
    indicator += '    <div class="mask full" style="transform: rotate(60deg);">';
    indicator += '      <div class="fill" style="transform: rotate(60deg);"></div>';
    indicator += '    </div>';
    indicator += '    <div class="mask half">';
    indicator += '      <div class="fill"></div>';
    indicator += '      <div class="fill fix" style="transform: rotate(120deg);"></div>';
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

let htmlLoading = '<div class="cs-loader"><label> ●</label><label> ●</label><label> ●</label></div>';

// This adds the user input to the chat and sends it to server for response
function addUserChat() {
  let question = {};
  question.title = $('#question').val();
  let date = getDateAndTime();

  // Regex checks if the string sent isn't only spaces
  if (/\S/.test(question.title)) {
    $('#chat').append('<li class="media"><div class="media-body row"><div class="pull-right"><img class="media-object img-circle " src="images/default-user.png"></div><div class="media-user-info">' + question.title + '<br><small class="text-muted">You | ' + '<span class="message-time" data-time-iso="' + moment().format() + '">' + moment().format("dddd, h:mm a") + '</span></span></div></div></div></li>');

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
  $('.read-more').off().each(function() {
    $(this).on('click', function() {
      if ($(this).text() === "Read More") {
        $(this).text("Collapse");
        $(this).removeClass('next').addClass('prev');
        $(this).prev().show('slow');
      } else {
        $(this).text("Read More");
        $(this).removeClass('prev').addClass('next');
        $(this).prev().hide('slow');
      }
      // $('.current-chat-area').scrollTop($('.current-chat-area')[0].scrollHeight);
    })
  })
}

function sendServerQuestion(question) {
  $('#chat').append('<li class="media loading"><div class="media-body row"><div class="pull-left"><img class="media-object img-circle " src="images/logo.png"></div><div class="media-watson-info loading-info">' + htmlLoading + '</div></div></li>');
  fetch("../questions/send-lite", {
    method: 'post',
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify({'question': question})
  }).then(response => {
    return response.json()
  }).then(json => {
    //console.log(json);
    $('.loading').remove();
    $('.current-message').attr('class', 'media-text');
    $('.btn-log').remove();
    $('.active-chat').removeClass('active-chat');
    // form answer array, max 4 answers will be stored
    const answerAry = json.response.docs.map(answerObj => {
      return formatAnswerByTag(answerObj.body);
    }).slice(0, 4);
    // form answer dom ele
    let answerDom = "";
    answerDom += '<li class="media"><div class="media-body row"><div class="pull-left"><img class="media-object img-circle " src="images/logo.png"></div><div class="media-watson-info active-chat">';

    if (answerAry.length > 0) {
      for (let i = 0; i < answerAry.length; i++) {
        if (i === 0) {
          answerDom += '<div class="answer-content-wrapper media-text active-answer" style="display:block" data-answer-content=' + i + '>' + answerAry[i] + '</div>';
        } else {
          answerDom += '<div class="answer-content-wrapper media-text" style="display:none" data-answer-content=' + i + '>' + answerAry[i] + '</div>';
        }
      }
      if (answerAry.length > 1) {
        // generate buttons
        answerDom += '<div class="media-text additional">View a different answer by clicking a button below.</div>';
        answerDom += '<div class="btn-group other-answers" role="group" aria-label="...">';
        for (let i = 0; i < answerAry.length; i++) {
          answerDom += '<div class="answer-switch-btn" data-answer-btn=' + i + '>';
          if (i === 0) {
            answerDom += '<i class="fa fa-circle" aria-hidden="true"></i>';
          } else {
            answerDom += '<i class="fa fa-circle-o" aria-hidden="true"></i>';
          }
          answerDom += '</div>';
        }
        answerDom += '</div>';
      }

    }
    answerDom += '<div type="buttion" class="btn btn-danger btn-log pull-right btn-incorrect-answer" data-question-body="' + question + '">No Correct Answers</div>';
    let timeAsked = '<span class="message-time" data-time-iso="' + moment().format() + '">' + moment().format("dddd, h:mm a") + '</span>';
    answerDom += '</p><small class="text-muted">Powered by <span class="watson-power-tag"><img class="small-chat-bubble-icon" src="images/watson-icon.png" /> Watson</span> | ' + timeAsked + '</p>';
    answerDom += '</span></div></div></div></li>';
    $('#chat').append(answerDom);
    initProgressHandler();
    addReadmoreHandler();
    $('.current-chat-area').animate({scrollTop: $(".scroll-chat").height()});
    shouldDisplayTour().then(tourBool => {
      if (tourBool) {
        initTourSecondPart();
        setTimeout(() => {
          displayTourSecondPart()
        }, 100)
      }
    })
    $('#question').val('');
  });
}

////////////////////////////////////
/// Answer progress handler
////////////////////////////////////
const initProgressHandler = () => {
  $($('.active-answer .progress-section .step-content .step')[0]).show();
  initPNBtnHandler();
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

const initPNBtnHandler = () => {
  $('.previous-step-btn').each((index, btn) => {
    $(btn).off().on('click', () => {
      const ele = $(btn).closest('.progress-section')[0];
      const currentStep = $(ele).data("on-step");
      if (currentStep > 1) {
        $(ele).data("on-step", currentStep - 1);
        updateProgressIndicator(ele);
        updateStep(ele);
      }
    })
  })

  $('.next-step-btn').each((index, btn) => {
    $(btn).off().on('click', () => {
      const ele = $(btn).closest('.progress-section')[0];
      const currentStep = $(ele).data("on-step");
      const totalStep = $(ele).data("total-step");
      if (currentStep < totalStep) {
        $(ele).data("on-step", currentStep + 1);
        updateProgressIndicator(ele);
        updateStep(ele);
      }
    })
  })
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
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
}

const externalQuestionListener = () => {
  if (window.location.pathname == '/lite-version.html') {
    const url = new URL(window.location.href);
    window.history.pushState("object or string", "Title", "/" + window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]);
    const externalQuestionString = url.searchParams.get("q");
    if (externalQuestionString != null && externalQuestionString.length > 0 && externalQuestionString.trim() != "") {
      $('#question').val(externalQuestionString.trim());
      setTimeout(() => {
        $('#send').click();
      }, 50)
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
    body: JSON.stringify({'question': question, 'answers': null})
  }).then(response => {
    return response.json()
  }).then(json => {
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
    questionHTML = questionHTML + '<div class="panel-heading" role="tab">'
    questionHTML = questionHTML + '<h3 class="panel-title">'
    questionHTML += '<input class="unsatisfy-question" type="checkbox" value="' + question[i]._id + '">'
    questionHTML = questionHTML + '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '" aria-expanded="true" aria-controls="collapseOne">';
    questionHTML = questionHTML + question[i].body;
    questionHTML = questionHTML + '</a>'
    questionHTML = questionHTML + '</h3>'
    questionHTML = questionHTML + '</div>'
    questionHTML = questionHTML + '<div id="collapse' + i + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">'
    questionHTML = questionHTML + '<div class="panel-body logged-stats">'
    questionHTML = questionHTML + "<pre>" + JSON.stringify(question[i].feature, '\t', 2) + " </pre>" + "Low Confidence Level: " + question[i].low_confidence.relevance_level;
    questionHTML = questionHTML + '</div>';
    questionHTML = questionHTML + '</div>';
    questionHTML = questionHTML + '</div>';
  }
  questionHTML += '<button type="button" class="btn-lg btn-default btn-mark-all-question">Mark All</button><button type="button" class="btn-lg btn-default btn-export-question">Export List</button><button class="btn-lg btn-default btn-mark-trained" type="button">Mark Trained</button';
  return questionListHTMLH + questionHTML + questionListHTMLT;

}

const showAIStatus = () => {
  loadAnimationOn('.current-chat');
  fetch("../ai/get-statistics", {
    method: 'get',
    headers: {
      "Content-type": "application/json",
      "x-access-token": JSON.parse(localStorage['iaa-userToken'])
    }
  }).then(response => {
    return response.json()
  }).then(json => {
    setTimeout(function() {
      removeLoadAnimationOn('.current-chat')
    }, 1000);

    showPage('.server-status');
  })
}

function showLowQuestions() {
  loadAnimationOn('.current-chat');
  fetch("../questions/get-low-confidence", {
    method: 'get',
    headers: {
      "Content-type": "application/json",
      "x-access-token": JSON.parse(localStorage['iaa-userToken'])
    }
  }).then(response => {
    return response.json()
  }).then(json => {
    setTimeout(function() {
      removeLoadAnimationOn('.current-chat')
    }, 1000);
    var questionList = questionWrapper(json);
    $('.current-chat').append(questionList);
    showPage('.logged-questions');
    // btn handler
    $('.btn-mark-all-question').click(() => {
      $('.unsatisfy-question:checkbox:not(:checked)').click();
    })
    $('.btn-export-question').click(() => {
      let questionList = "";
      $('.unsatisfy-question:checkbox:checked').each((index, ele) => {
        const questionText = $(ele).siblings().text();
        questionList += questionText + '\n';
      })
      generateQuestionListTextFileAndDownload(questionList);
    })
    $('.btn-mark-trained').click(() => {
      let qidAry = [];
      $('.unsatisfy-question:checkbox:checked').each((index, ele) => {
        const questionID = $(ele).val();
        qidAry.unshift(questionID);
      })
      fetch("../questions/mark-trained-question", {
        method: 'post',
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "x-access-token": JSON.parse(localStorage['iaa-userToken'])
        },
        body: JSON.stringify({question_id: qidAry})
      }).then(response => {
        return response.json()
      }).then(json => {
        $.notify('Success update: ' + json.succeed, + ' failed update: ' + json.failed, {
          className: "success",
          clickToHide: true,
          autoHide: true
        })
        // re-render list
        json.success_ids.map(qid => {
          const input = $(':input').filter(function() {
            return this.value == qid
          })[0];
          const parentPanel = $($(input).closest('.panel')[0]);
          parentPanel.hide('slow', function() {
            parentPanel.remove()
          });
        })

      })
    })
  })

}

// -------------------------------------- Sign in Stuff ---------------------------------- //
function login() {
  let email = document.getElementById('inputUserEmail').value;
  let password = document.getElementById('inputUserPassword').value;
  loadAnimationOn('.container-fluid');
  fetch("/users/signin", {
    method: 'post',
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: 'email=' + email + '&password=' + password,
    credentials: 'include'
  }).then(response => {
    return response.json()
  }).then(json => {
    removeLoadAnimationOn('.container-fluid');
    if (json.err) {
      // TODO handle failure of login
      $.notify(json.err, {
        className: "error",
        clickToHide: true,
        autoHide: true
      })
    } else {
      localStorage['iaa-userToken'] = JSON.stringify(json.token);
      getUserInfo().then(json => {
        // notify login
        $.notify("Successfully Signed In", {
          className: "success",
          clickToHide: true,
          autoHide: true
        })
        // TODO change - Currently redirecting to lite because full is not done
        // hide login/register btn
        $('.text-benefits, .login-wrapper, .register-wrapper').hide();
        $('.logout, .btn-profile').show();
        // close login modal
        $('#loginModal').modal('toggle');
        const userDisplayName = capitalizeFirstLetter(json.first_name);
        $('.lite-header').text("Welcome " + userDisplayName);
        // show unstatisfy question tab
        if (json.hasOwnProperty('account_role') && json.account_role === "advisor") {
          $('.question-tab').show();
        }
      })

    }
  })
}

const initBtnHandler = () => {
  // logo
  $('.home_anchor').click((e) => {
    e.preventDefault();
    if (!$('.current-chat-area').hasClass('active')) {
      hideAllPage();
      showPage('.current-chat-area');
    }
  })
  // login & signup
  $('.btn-register').click(e => {
    e.preventDefault();
    loadAnimationOn('.container-fluid');
    let email = document.getElementById('inputEmail').value;
    let password = document.getElementById('inputPassword').value;
    let password2 = document.getElementById('inputConfirmPassword').value;
    let first_name = document.getElementById('inputUserF').value;
    let last_name = document.getElementById('inputUserL').value;

    let select = document.getElementById('major');
    let major = [];
    major.unshift(select.options[select.selectedIndex].value);

    fetch("/users/signup", {
      method: 'post',
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify({
        'email': email,
        'password': password,
        'password2': password2,
        'first_name': first_name,
        'last_name': last_name,
        'account_role': 'student',
        'majors': major
      })
    }).then(response => {
      return response.json()
    }).then(json => {
      removeLoadAnimationOn('.container-fluid');
      if (json.err) {
        // TODO handle failure of registration
        $.notify(json.err.message, {
          className: "error",
          clickToHide: true,
          autoHide: true
        })
      } else {
        // close login modal
        $('#RegisterModal').modal('toggle');
        // TODO change - Currently redirecting to lite because full is not done
        $.notify('You account has successfully created, we have sent a activation email to you, please check your email and active your account.', {
          className: "success",
          clickToHide: true,
          autoHide: true
        })
      }
    });

  })
  // profile
  $($('.btn-profile button')[0]).click(() => {
    if (!$('.profile-area').hasClass('active')) {
      // hide chat
      hideAllPage();
      // change button text
      $($('.btn-profile button')[0]).text('Chat');
      loadAnimationOn('.current-chat');
      getUserInfo().then(json => {
        // name & email
        $('.profile-user-name').val(capitalizeFirstLetter(json.first_name + " " + json.last_name));
        $('.profile-email').val(json.email);
        // introduction & personality & wordcloud
        if (json.hasOwnProperty('personality_evaluation')) {
          if (json.personality_evaluation.hasOwnProperty('description_content')) {
            const areaWidth = $('.current-chat').width();
            const introductionEle = $('.profile-introduction');
            introductionEle.css({"width": areaWidth});
            introductionEle.val(json.personality_evaluation.description_content);
          }
          if (json.personality_evaluation.hasOwnProperty('evaluation')) {
            $('.profile-personality').show();
            $('.legend').empty();
            json.personality_evaluation.evaluation.values.map(item => {
              $('.legend').append('<li><em>' + item.name + '</em><span>' + (item.percentile * 100).toFixed(1) + '</span></li>')
            })
            createPie(".pieID.legend", ".pieID.pie");
          }
          if (json.hasOwnProperty('interest')) {
            $('.profile-wordCloud').show();
            // $('.word-cloud').text(JSON.stringify(json.interest));
            const wordList = json.interest.interest.map(item => {
              return [
                item.term,
                parseInt(item.value, 10) + 6
              ];
            })
            //console.log(wordList);
            // WordCloud(document.getElementById('my_canvas'), { list: list } );
            if (WordCloud.isSupported) {
              WordCloud($('#word-cloud')[0], {
                list: wordList,
                gridSize: 30,
                weightFactor: function(size) {
                  return Math.pow(size, 2.3) * $('#word-cloud').width() / 1024;
                },
                fontFamily: 'Times, serif',
                color: function(word, weight) {
                  return (weight === 12)
                    ? '#1E407C'
                    : '#1E407C';
                },
                rotateRatio: 0,
                rotationSteps: 0,
                clearCanvas: true,
                minSize: 35,
                shuffle: true,
                backgroundColor: '#fff'
              });
            }

          }
        }
        removeLoadAnimationOn('.current-chat');
        // show profile section
        showPage('.profile-area');
        $('.profile-introduction').css({
          "height": $('.profile-introduction').prop('scrollHeight') / 3
        });
      })
    } else {
      $($('.btn-profile button')[0]).text('Profile');
      hideAllPage();
      showPage('.current-chat-area');
    }

  })

  $('.btn-profile-introduction-save').click(() => {
    const payload = {
      introduction: $('.profile-introduction').val()
    };
    //console.log(payload);
    fetch("/profile/update-introduction", {
      method: 'post',
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        "x-access-token": JSON.parse(localStorage['iaa-userToken'])
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    }).then(response => {
      return response.json()
    }).then(json => {
      if (json.status == "success") {
        $.notify("Successfully upload your introduction!", {
          className: "success",
          clickToHide: true,
          autoHide: true
        })
      } else if (json.error) {
        $.notify(json.message, {
          className: "error",
          clickToHide: true,
          autoHide: true
        })
      }
    });
  })
  // logout
  $($('.logout button')[0]).click(() => {
    // notify logout
    $.notify("Goodbye!", {
      className: "success",
      clickToHide: true,
      autoHide: true
    })
    $('.text-benefits, .login-wrapper, .register-wrapper').show();
    $('.logout, .btn-profile').hide();
    localStorage['iaa-userToken'] = null;
    $('.question-tab').hide();
    $('.server-status').hide();
    $('.lite-header').text("Welcome Visitor");
    hideAllPage();
    showPage('.current-chat-area');
  })
  // sample question refresh btn
  $('.refresh-btn-sample-question').click(() => {
    rotateEle($('.refresh-btn-sample-question i'));
    $('.sample-question-area').hide('slow', () => {
      $('.sample-question-area').empty();
      // retrieve and re-render
      fetch('/questions/get-trained-question', {method: 'get'}).then(response => {
        return response.json()
      }).then(json => {
        json.map(questionAry => {
          if (Object.keys(questionAry).length > 0 && questionAry.constructor === Object) {
            let parseHTML = '<ul class="example-question-list"><label>' + capitalizeFirstLetter(questionAry.questions[0].keyword) + '</label>';
            questionAry.questions.map(questionObj => {
              parseHTML += '<li class="suggest-question-element"><i class="fa fa-hashtag" aria-hidden="true"></i>&nbsp;' + questionObj.body + '</li>';

            })
            parseHTML += '</ul>';
            $('.sample-question-area').append(parseHTML);
          }
        });
        $('.refresh-btn-sample-question i').removeClass('spin');
        $('.sample-question-area').show('slow')
      })
    })
  })

}

const initGetSampleQuestion = () => {
  // example Questions
  $('.btn-sample-question').click((e) => {
    e.preventDefault();
    hideAllPage();
    loadAnimationOn('.current-chat');
    if ($('.btn-sample-question').text().trim() === "Suggested Question") {
      $('.btn-sample-question').html('<i class="fa fa-chevron-left" aria-hidden="true"></i> Back to Chat')
      $('.sample-question-area').empty();
      fetch('/questions/get-trained-question', {method: 'get'}).then(response => {
        return response.json()
      }).then(json => {
        json.map(questionAry => {
          if (Object.keys(questionAry).length > 0 && questionAry.constructor === Object) {
            let parseHTML = '<ul class="example-question-list"><label>' + capitalizeFirstLetter(questionAry.questions[0].keyword) + '</label>';
            questionAry.questions.map(questionObj => {
              parseHTML += '<li class="suggest-question-element"><i class="fa fa-hashtag" aria-hidden="true"></i>&nbsp;' + questionObj.body + '</li>';

            })
            parseHTML += '</ul>';
            $('.sample-question-area').append(parseHTML);
          }
        });
        showPage('.sample-question-container');
        removeLoadAnimationOn('.current-chat');
      })
    } else {
      showPage('.current-chat-area');
      $('.btn-sample-question').text('Suggested Question');
      removeLoadAnimationOn('.current-chat');
    }
  })
}

const initUserAccountListener = () => {
  getUserInfo().then(json => {
    if (json.hasOwnProperty('_id')) {
      // hide login/register btn
      $('.text-benefits, .login-wrapper, .register-wrapper').hide();
      $('.logout, .btn-profile').show();
      const userDisplayName = capitalizeFirstLetter(json.first_name);
      $('.lite-header').text("Welcome " + userDisplayName);
    }
    // show unstatisfy question tab
    if (json.hasOwnProperty('account_role') && json.account_role === "advisor") {
      $('.question-tab').show();
      $('.server-status').show();
    }
  })
}

const getUserInfo = () => {
  return new Promise(function(resolve, reject) {
    loadAnimationOn('.current-chat');
    // get user info
    fetch("/users/get-user", {
      method: 'get',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-access-token": JSON.parse(localStorage['iaa-userToken'])
      }
    }).then(response => {
      removeLoadAnimationOn('.current-chat');
      resolve(response.json())
    }).catch(err => {
      removeLoadAnimationOn('.current-chat');
      reject(err)
    })
  });
}

const generateQuestionListTextFileAndDownload = (questionList) => {

  if ('Blob' in window) {
    var fileName = 'questionList.txt';
    if (fileName) {
      var textToWrite = questionList;
      var textFileAsBlob = new Blob([textToWrite], {type: 'text/plain'});

      if ('msSaveOrOpenBlob' in navigator) {
        navigator.msSaveOrOpenBlob(textFileAsBlob, fileName);
      } else {
        var downloadLink = document.createElement('a');
        downloadLink.download = fileName;
        downloadLink.innerHTML = 'Download File';

        if ('URL' in window) {
          // Chrome allows the link to be clicked without actually adding it to the DOM.
          downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        } else {
          // Firefox requires the link to be added to the DOM before it can be clicked.
          downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
          downloadLink.click(function() {
            document.body.removeChild(event.target);
          });

          downloadLink.style.display = 'none';
          document.body.appendChild(downloadLink);
        }
        downloadLink.click();
      }
    }
  } else {
    $.notify('Your browser can not generate text file and download.', {
      className: "error",
      clickToHide: true,
      autoHide: true
    })
  }
}

const initBornTime = () => {
  const bornTime = moment([2017, 6, 14]);
  $('.time-from-born').text(bornTime.toNow(true));
}

// utility func
const capitalizeFirstLetter = (str) => {
  return str.toLowerCase().split(' ').map(function(word) {
    return word[0].toUpperCase() + word.substr(1);
  }).join(' ');
}

function sliceSize(dataNum, dataTotal) {
  return (dataNum / dataTotal) * 360;
}
function addSlice(sliceSize, pieElement, offset, sliceID, color) {
  $(pieElement).append("<div class='slice " + sliceID + "'><span></span></div>");
  var offset = offset - 1;
  var sizeRotation = -179 + sliceSize;
  $("." + sliceID).css({
    "transform": "rotate(" + offset + "deg) translate3d(0,0,0)"
  });
  $("." + sliceID + " span").css({
    "transform": "rotate(" + sizeRotation + "deg) translate3d(0,0,0)",
    "background-color": color
  });
}
function iterateSlices(sliceSize, pieElement, offset, dataCount, sliceCount, color) {
  var sliceID = "s" + dataCount + "-" + sliceCount;
  var maxSize = 179;
  if (sliceSize <= maxSize) {
    addSlice(sliceSize, pieElement, offset, sliceID, color);
  } else {
    addSlice(maxSize, pieElement, offset, sliceID, color);
    iterateSlices(sliceSize - maxSize, pieElement, offset + maxSize, dataCount, sliceCount + 1, color);
  }
}
function createPie(dataElement, pieElement) {
  var listData = [];
  $(dataElement + " span").each(function() {
    listData.push(Number($(this).html()));
  });
  var listTotal = 0;
  for (var i = 0; i < listData.length; i++) {
    listTotal += listData[i];
  }
  var offset = 0;
  var color = [
    "cornflowerblue",
    "olivedrab",
    "orange",
    "tomato",
    "crimson",
    "purple",
    "turquoise",
    "forestgreen",
    "navy",
    "gray"
  ];
  for (var i = 0; i < listData.length; i++) {
    var size = sliceSize(listData[i], listTotal);
    iterateSlices(size, pieElement, offset, i, 0, color[i]);
    $(dataElement + " li:nth-child(" + (i + 1) + ")").css("border-color", color[i]);
    offset += size;
  }
}

const hideAllPage = () => {
  // fill page class name here
  pageClass.forEach(page => {
    $(page).hide();
    $($(page)).removeClass('active');
  })
}

const showPage = selctor => {
  if (pageClass.indexOf(selctor) != -1) {
    // change title
    const title = pageTitle[pageClass.indexOf(selctor)];
    $('.lite-header').text(title);
    $(selctor).show('slow');
    $($(selctor)).addClass('active');
  }

}

const loadAnimationOn = ele => {
  const loaderHtml = '<div class="loading-animation-warpper scrollable"><div class="cs-loader"><label> ●</label><label> ●</label><label> ●</label></div></div>';
  $(ele).append(loaderHtml);
}

const removeLoadAnimationOn = ele => {
  $(ele).find(".loading-animation-warpper").remove();
}

const initAnswerVideoSizeFitOnResize = () => {
  $(window).on('resize', function() {
    fitCurrentAnswerVideo();
  });
}

const fitCurrentAnswerVideo = () => {
  $('.answerHTMLDOM').find('iframe').each((index, ele) => {
    const chatBubbleWidth = $(ele).closest('.media-watson-info').width()
    $(ele).width(chatBubbleWidth * 0.8)
  })
}

const rotateEle = (ele) => {
  ele.addClass('spin');
}
