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
          location.href = "/admin"
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

// display personality assessement on profile page
$(() => {
  if (location.href.match(/http:\/\/localhost:3000\/profile.*/gi) || location.href.match(/http:\/\/intelligent-student-advisor.herokuapp.com\/profile.*/gi) || location.href.match(/https:\/\/intelligent-student-advisor.herokuapp.com\/profile.*/gi)) {

    var svg = d3.select("#personality-assessement").append("svg").append("g")

    svg.append("g").attr("class", "slices");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "lines");

    var width = 850,
      height = 450,
      radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie().sort(null).value(function(d) {
      return d.value;
    });

    var arc = d3.svg.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc().innerRadius(radius * 0.9).outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = function(d) {
      return d.data.label;
    };

    let domainAry = [];
    let domainTermPercentailAry = [];
    let domainTermValueAry = [];

    const colorRangeAry = shuffleAry([
      "#a05d56",
      "#d0743c",
      "#ff8c00",
      "#b0ff38",
      "#38b0ff",
      "#ff38b0",
      "#8738ff",
      "#EAFEAF",
      "#a3b17a",
      "#afeafe",
      "#1805df",
      "#b9b4f5",
      "#0c026f"
    ]);

    const clearDataAry = () => {
      // // clear each array
      domainAry.splice(0, domainAry.length);
      domainTermPercentailAry.splice(0, domainTermPercentailAry.length);
      domainTermValueAry.splice(0, domainTermValueAry.length);
    }

    const loadAssessmentData = (personality_assessement) => {
      if (!jQuery.isEmptyObject(personality_assessement)) { // fill dataAry
        personality_assessement.personality.map((personalityCategory) => {
          domainAry.unshift(personalityCategory.name);
          domainTermPercentailAry.unshift(personalityCategory.percentile)
          domainTermValueAry.unshift(personalityCategory.percentile + personalityCategory.raw_score);
        });

        // reset personality display to normal size and hide warning message
        $('#personality-assessement').css('height', '450px');
        $('#personality-assessement-insufficient-word-message').css('display', 'none');
      } else {
        // if prevous svg drawed
        if ($('#personality-assessement svg').length > 0) {
          // clean up drawing
          $('#personality-assessement svg g .slices').empty();
          $('#personality-assessement svg g .labels').empty();
          $('#personality-assessement svg g .lines').empty();

          // shrink personality display section and show warning message about description is less than 100 words
          $('#personality-assessement-insufficient-word-message').css('display', 'block');
          $('#personality-assessement').css('height', '100px');
        }
      }
    }

    var color = d3.scale.ordinal().domain(domainAry).range(colorRangeAry);

    function parseData() {
      let returnVal = [];

      for (let i = 0; i < domainAry.length; i++) {
        // ex: Openness-55.69%
        const label = domainAry[i] + " - " + (domainTermPercentailAry[i] * 100).toFixed(1) + "%";
        const value = domainTermValueAry[i];
        returnVal.unshift({label: label, value: value});
      }

      return returnVal;
    }

    // fire d3 to generate display
    const drawPersonalityAssessment = (personality_assessement) => {
      clearDataAry();
      loadAssessmentData(personality_assessement);

      if (!jQuery.isEmptyObject(personality_assessement)) {
        setTimeout(() => {
          change(parseData());
        }, 500);
      }

    }

    drawPersonalityAssessment(personality_assessement);

    function change(data) {

      /* ------- PIE SLICES -------*/
      var slice = svg.select(".slices").selectAll("path.slice").data(pie(data), key);

      slice.enter().insert("path").style("fill", function(d) {
        return color(d.data.label);
      }).attr("class", "slice");

      slice.transition().duration(1000).attrTween("d", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      })

      slice.exit().remove();

      /* ------- TEXT LABELS -------*/

      var text = svg.select(".labels").selectAll("text").data(pie(data), key);

      text.enter().append("text").attr("dy", ".35em").text(function(d) {
        return d.data.label;
      });

      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }

      text.transition().duration(1000).attrTween("transform", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * (midAngle(d2) < Math.PI
            ? 1
            : -1);
          return "translate(" + pos + ")";
        };
      }).styleTween("text-anchor", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          return midAngle(d2) < Math.PI
            ? "start"
            : "end";
        };
      });

      text.exit().remove();

      /* ------- SLICE TO TEXT POLYLINES -------*/

      var polyline = svg.select(".lines").selectAll("polyline").data(pie(data), key);

      polyline.enter().append("polyline");

      polyline.transition().duration(1000).attrTween("points", function(d) {
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          var d2 = interpolate(t);
          var pos = outerArc.centroid(d2);
          pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI
            ? 1
            : -1);
          return [arc.centroid(d2), outerArc.centroid(d2), pos];
        };
      });

      polyline.exit().remove();
    };

    // for upload self description at /uploadPersonal
    const myDropzone = new Dropzone("#upload-description-Text-File", {url: "/api/profile/upload/upload-description-text-file"});
    myDropzone.on("success", function(file) {
      // prompt success upload
      generateNotice('success', 'Successfully upload your document.');

      // fetch new self descrition(introduction) and render on profile page
      const getIntroductionAPIUrl = "/api/profile/get-introduction";
      fetch(getIntroductionAPIUrl, {
        method: "GET",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }).then(function(res) {
        if (res.status !== 200) {
          generateNotice(res.type, "Error, " + res.information);
        } else {
          res.json().then(function(res) {
            // refresh introduction
            $('#introduction-content-p').text(res.introduction);

            // re-render interest
            setTimeout(() => {
              fetchAndRenderInterest()
            }, 1000);
          })
        };
        // change left text to the same high as dropzone, for better view
        $('#introduction-content-p').css('height', $('.dropzone').height() + 24 + "px");
      }).catch(function(err) {
        generateNotice('error', err)
      });

      // fetch new personality assessment and render on profile page
      const getPersonalityAssessmentAPIUrl = "/api/profile/get-personalityAssessment";
      fetch(getPersonalityAssessmentAPIUrl, {
        method: "GET",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
      }).then(function(res) {
        if (res.status !== 200) {
          generateNotice(res.type, "Error, " + res.information);
        } else {
          res.json().then(function(res) {
            const assessement = res.assessment;
            drawPersonalityAssessment(assessement);
          })
        };
      }).catch(function(err) {
        generateNotice('error', err)
      });

    })
  }

})

// shuffle array
function shuffleAry(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// for upload source learning document at /SystemManagement
$(function() {
  $("#upload-system-learning-document").dropzone({url: "/api/system/update/domain"});
});

//////////////////////////////////////////////////
// user like/fav question answer handler functions
//////////////////////////////////////////////////
const addLikeBtnHandler = function(answerSequenceNumber) {
  $($('.answer-like-btn')[answerSequenceNumber]).on('click', function() {
    const targetAnswer = $('[data-answer-seq=' + answerSequenceNumber + ']').text();
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
    const passwordValidRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    const spcialCharRegex = new RegExp("(?=.*[!@#\$%\^&\*])");
    const password = $('#signup-form-password').val();
    if (!passwordValidRegex.test(password) || spcialCharRegex.test(password) || password.length == 0) {
      return generateNotice('error', 'Invalid password format, please check the rules of password.');
      $('.password-rule-list').fadeIn('fast').effect("shake");
    }

    // replace submit btn to loader animation before request
    $("#signup-form button").fadeOut('fast');
    $("#signup-form .loader").fadeIn('fast');

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
          return generateNotice(res.type, "Error, " + res.information);
        } else {
          generateNotice(res.type, res.information);
          // empty signup form
          $('#signup-form input').each((index, element) => {
            $(element).val("")
          });
        }
      })

      // when finish (success) restore submit button and hide loader
      $("#signup-form .loader").fadeOut('fast');
      $("#signup-form button").fadeIn('fast');
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
            location.href = '/profile';
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

///////////////////////////////////////////////////////////////////////////////////////////
// This function toggle the admin/advisor token for signup
///////////////////////////////////////////////////////////////////////////////////////////
$(function() {
  $("#form-register-role").change(function() {
    if ($("#form-register-role option:selected").text() === "Admin") {
      $("#form-admin-token").removeClass("hidden");
    } else {
      $("#form-admin-token").addClass("hidden");
    }

    if ($("#form-register-role option:selected").text() === "Advisor") {
      $("#form-advisor-token").removeClass("hidden");
    } else {
      $("#form-advisor-token").addClass("hidden");
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
      result.feeds.map((feed, index) => {
        let trendingIcon = '';
        if (index < 3) {
          trendingIcon = "<i class=\"fa fa-signal\" aria-hidden=\"true\"></i>&nbsp&nbsp";
        }
        const feedHtmlListElement = "<li>" +
        "<a href=\"#\" class=\"question-feed-content\">" + trendingIcon + feed + "</a></li>";
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

// Submit question handler
$(() => {

  $('#querySubmitBtn').click(function(e) {
    // clear previous results
    $('#answer-list').empty();

    var $inputMessage = $('#userQueryInput'); // Input message input box

    // Prevent markup from being injected into the message
    let message = cleanInput($inputMessage.val());

    // if there is a non-empty message and a socket connection
    if (message.length > 0) {

      // start loader animation in answer area

      // post question to server
      const url = '/api/question-answer/ask';
      fetch(url, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: "question=" + encodeURIComponent(message)
      }).then(function(res) {
        if (res.status !== 200) {
          generateNotice('error', "Error, status code: " + res.status);
          return;
        }
        res.json().then(function(result) {
          addChatMessage('server', result);
        })
      }).catch(function(err) {
        generateNotice('error', err)
      });

      addChatMessage("client", message);
    }
  })

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
})

$(() => {
  if ($('#external_question').text().length > 0) {
    const external_question = $('#external_question').text();
    $('#userQueryInput').val(external_question);
    setTimeout(() => {
      $('#querySubmitBtn').click();
    }, 300);
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

const addAnswerRelatedQuestionHandler = () => {
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

const cleanInput = function(input) {
  return input.trim();
}

//update display message function
const addChatMessage = function(sender, message) {
  const chatWindow = $('#answer-list');
  // hide answer warning message by default
  $('#answer-low-confidence-warning').addClass("hide");

  if (sender === "server") {
    // data.confidence (bool) indicates either user's question is in the knowledge doman or not

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
      respond += "<div data-toggle=\"tooltip\" data-container=\"body\" ></div>"

      //add answer body
      respond += "<div class=\"answer\"><p class=\"answer-body\">" + formatAnswerByTag(answer.body) + "</p></div>";

      //end adding, wrap up whole section
      respond += "</li>"

      chatWindow.append(respond);

    })

    // add read more handler
    addReadmoreHandler();
  }

  if (sender === "client") {

    // display user input question
    let respond = "<li class=\"list-group-item list-group-item-info text-right\">";
    // add question body
    respond += "<div class=\"question\">" + message + "</div>";
    respond += "</li>";
    chatWindow.append(respond);
    $("#user-question").text(message);
  }
}
