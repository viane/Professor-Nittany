// show intro if user is "frist" time use the interface
const dataStorage = window.localStorage;
$(() => {
  // turorial
  if ($(window).width() > 768) {
    if (!localStorage.hasOwnProperty('iaa-showTourBool')) {
      setLocalTourBool(null);
    }

    // check local storage for tour record, if never been decleared
    if (shownTour() === null) {
      setLocalTourBool(false);
    }
    shouldDisplayTour().then(tourBool => {
      if (tourBool) {
        $('#overlay').fadeIn(300);
        $("[data-tour-step=1]").addClass('expose');
        displayTourFirstPart();
      }
    })
  }

})

const displayTourFirstPart = () => {
  // Define the tour
  const liteVersionTour = {
    id: "lite-version",
    steps: [
      {
        title: "Welcome!",
        content: "Hi there! It's nice to see you! Let me walk you through some basic components about the lite version chat interface.",
        target: $(".title")[0],
        placement: "bottom",
        xOffset: 20,
        showNextButton: true
      }, {
        title: "General info pannel.",
        content: "You can find out most direct information about what I am in this pannel.",
        target: $("#accordion")[0],
        placement: "top",
        showPrevButton: true,
        showNextButton: true
      }, {
        title: "Some questions guide for you!",
        content: "You can reference some basic/start-up questions from this tab that I usually asked by people.",
        target: $("#headingThree")[0],
        placement: "top",

        showNextButton: true
      }, {
        title: "Register and Login to experience personalized service!",
        content: "You can obtain personalized advises after you register",
        target: $(".userLog")[0],
        placement: "top",
        xOffset: 18,
        showNextButton: true
      }, {
        title: "Raise your question!",
        content: "Write down your question here whenever your are ready! In this turorial, I filled one of the popular question for you.",
        target: $("#question")[0],
        placement: "top",
        width: "350",
        showNextButton: true,
        onShow: () => {
          setTimeout(() => {
            $('#question').val("what is world campus?")
          }, 1);
        }
      }, {
        title: "Let's Chat!",
        content: "Press this button or press ENTER on your keyboard to send the question to me!",
        target: $("#send")[0],
        placement: "top",
        arrowOffset: 265,
        xOffset: -255,
        showNextButton: true,
        onShow: () => {
          $('#send').click(() => {
            $('.expose').removeClass('expose');
            hopscotch.endTour();
            $('#send').off('click').click(() => {
              addUserChat()
            });
          });
          $('.hopscotch-next').click(() => {
            $('#send').click();
            $('.hopscotch-next').off('click')
          })
        }
      }
    ],
    showPrevButton: true,
    onPrev: () => {
      const currentStep = $('.expose').attr('data-tour-step');
      const prevTourEle = "[data-tour-step=" + (~~ currentStep - 1) + "]";
      $('.expose').removeClass('expose');
      $(prevTourEle).addClass('expose');
    },
    onNext: () => {
      const currentStep = $('.expose').attr('data-tour-step');
      const nextTourEle = "[data-tour-step=" + (~~ currentStep + 1) + "]";
      $('.expose').removeClass('expose');
      $(nextTourEle).addClass('expose');
    },
    onClose: () => {
      //change localStorage
      setLocalTourBool(true);
      // if has userToken, update user DB record
      if (hasUserToken()) {}
      $('#overlay').fadeOut(300, function() {
        $('.expose').removeClass('expose');
      });
      hopscotch.endTour();
    },
    onEnd: () => {
      hopscotch.endTour();
    }
  };
  hopscotch.startTour(liteVersionTour, 0);
}

const initTourSecondPart = () => {

  // second tour start with step 10
  // select 2nd/current answer at step 10
  $('.active-chat').attr('data-tour-step', '10');
  // tour step for external link
  $($('.active-chat a')[0]).attr('data-tour-step', '11');
  $($('.answer-extra-info')[0]).attr('data-tour-step', '12');
  $($('.progress-indicator')[0]).attr('data-tour-step', '13');
  $($('.next-step-btn')[0]).attr('data-tour-step', '14');
  $($('.step iframe')[0]).attr('data-tour-step', '15');
  $($('.other-answers')[0]).attr('data-tour-step', '16');
  $($('.btn-incorrect-answer')[0]).attr('data-tour-step', '17');
  $($('.lite-header')[0]).attr('data-tour-step', '18');
}

const displayTourSecondPart = () => {
  $('#overlay').fadeIn(300);
  // second tour start with step 10
  // add mask
  $("[data-tour-step=10]").addClass('expose');
  const liteVersionTour2 = {
    id: "lite-version-2",
    steps: [
      {
        title: "The Answer!",
        content: "There goes your answer! Sometimes it's bit long so please bear with me few more moment to walk through all the part.",
        target: $('.active-chat')[0],
        placement: "top",
        showNextButton: true
      }, {
        title: "An External Link",
        content: "The link provided in the answer usually are explained in detail or has more rich information you might need. Feel free to open it, it won't close our chat.",
        target: $('.active-chat a')[0],
        placement: "top",
        showNextButton: true
      }, {
        title: "Some More Information",
        content: "There are more information in this answer that are too long to show you in the first time, you can click the Read More button to see the extra information.",
        target: $('.answer-extra-info')[0],
        placement: "top",
        showNextButton: true
      }, {
        title: "More Than One Step!",
        content: "If you see a Progress Indicator here usually means the answer contains multiple steps to answer the question.",
        target: $('.progress-indicator')[0],
        placement: "top",
        showNextButton: true,
        arrowOffset: 265,
        xOffset: -229
      }, {
        title: "Check Next Step!",
        content: "Let's see what information is in the answer's next step.",
        target: $('.next-step-btn')[0],
        placement: "top",
        showNextButton: true,
        arrowOffset: 240,
        xOffset: -255,
        onShow: () => {
          $('.hopscotch-next').hide();
          // only click can continue to next step
          $($('.next-step-btn').find('i')[0]).click(() => {
            // force to scroll to bottom
            $('.current-chat-area').animate({
              scrollTop: $(".scroll-chat").height() + 40 + 'px'
            });
            setTimeout(() => {
              hopscotch.nextStep();
            }, 300)
            // cancel handler
            $($('.next-step-btn').find('i')[0]).off("click");
          });
        }
      }, {
        title: "Video is Worth a Thousand Words",
        content: "Bored at long text? Sit back and enjoy a short video, I bet you will like it!",
        target: $('.step iframe')[0],
        placement: "top",
        showNextButton: true
      }, {
        title: "Looking for Different Answers?",
        content: "Each person has their own taste on answer, sometime it's hard to satisify everyone with one thing, but I always trying to find every possiable answer that could answer your question.",
        target: $('.other-answers')[0],
        placement: "top",
        showNextButton: true,
        onShow: () => {
          $('.current-message').css('z-index', '100000').css('position', 'relative');
        }
      }, {
        title: "No Happy with All Answers?",
        content: "I very sorry that I didn't help if you couldn't find anything that is useful, but don't worry, good news is I'm always  learn. There are other human experts teach me on the question that I didn't answer well, click this button will let them know I need improvement on this question.",
        target: $('.btn-incorrect-answer')[0],
        placement: "top",
        showNextButton: true,
        arrowOffset: 205,
        xOffset: -175
      }, {
        title: "That's All You Need to Know",
        content: "Congratulation, you finished all the steps in the tutorial, thank you for being patient with me. Next step for you is just go ahead ask me questions!",
        target: $('.lite-header')[0],
        placement: "bottom"
      }
    ],
    showPrevButton: false,
    onPrev: () => {
      const currentStep = $('.expose').attr('data-tour-step');
      const prevTourEle = "[data-tour-step=" + (~~ currentStep - 1) + "]";
      $('.expose').removeClass('expose');
      $(prevTourEle).addClass('expose');
    },
    onNext: () => {
      const currentStep = $('.expose').attr('data-tour-step');
      const nextTourEle = "[data-tour-step=" + (~~ currentStep + 1) + "]";
      $('.expose').removeClass('expose');
      $(nextTourEle).addClass('expose');
    },
    onClose: () => {
      //change localStorage
      setLocalTourBool(true);
      // if has userToken, update user DB record
      if (hasUserToken()) {}
      $('#overlay').fadeOut(300, function() {
        $('.expose').removeClass('expose');
      });
      setTimeout(() => {
        $('.current-message').css({'z-index': '', 'position': ''});
      }, 100)
      hopscotch.endTour();
    },
    onEnd: () => {
      $('#overlay').fadeOut(300, function() {
        $('.expose').removeClass('expose');
      });
      // all tutorials are finished
      setLocalTourBool(true);
      setTimeout(() => {
        $('.current-message').css({'z-index': '', 'position': ''});
      }, 100)
      hopscotch.endTour();
    }
  };
  hopscotch.startTour(liteVersionTour2, 0);
}

const setLocalTourBool = (boolVal) => {
  dataStorage.setItem('iaa-showTourBool', JSON.stringify(boolVal));
}

const hasUserToken = () => {
  const storage = localStorage;
  if (JSON.parse(storage['iaa-userToken']) && storage['iaa-userToken'].length > 0) {
    return storage['iaa-userToken'];
  } else {
    return null;
  }
}

const shownTour = () => {
  const storage = localStorage;
  if (JSON.parse(storage['iaa-showTourBool']) != null) {
    return JSON.parse(storage['iaa-showTourBool']);
  } else {
    return null;
  }
}

const shouldDisplayTour = () => {
  return new Promise(function(resolve, reject) {
    // 3 case
    // 1.if no user token and no showTour in localStorage, start tour
    if (hasUserToken() === null && shownTour() === false) {
      resolve(true);
    }
    // if user token in storage
    if (hasUserToken()) {
      // check user data
      const userToken = hasUserToken();
      fetch("/users/get-user", {
        method: 'get',
        headers: {
          "Content-type": "application/json",
          "x-access-token": userToken
        }
      }).then(response => {
        return response.json()
      }).then(json => {
        // if 2.user signed in, check DB record
        if (json.hasOwnProperty('_id')) {
          if (!json.viewedTour.liteVersion) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          // 3.public visitor, start tour depends on localStorage record
          if (!shownTour()) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }).catch(err => {
        console.error(err);
      })
    }
  });

}
