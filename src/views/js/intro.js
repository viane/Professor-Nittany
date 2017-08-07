// show intro if user is "frist" time use the interface
const dataStorage = window.localStorage;
$(() => {

  if (!localStorage.hasOwnProperty('iaa-showTourBool')) {
    setLocalTourBool(null);
  }
  // Define the tour!
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
      },
      {
        title: "General info pannel.",
        content: "You can find out most direct information about what I am in this pannel.",
        target: $("#accordion")[0],
        placement: "top",
        showPrevButton: true,
        showNextButton: true
      },
      {
        title: "Some questions guide for you!",
        content: "You can reference some basic/start-up questions from this tab that I usually asked by people.",
        target: $("#headingThree")[0],
        placement: "top",

        showNextButton: true
      },
      {
        title: "Register and Login to experience personalized service!",
        content: "You can obtain personalized advises after you register",
        target: $(".userLog")[0],
        placement: "top",
        xOffset: 18,
        showNextButton: true
      },
      {
        title: "Raise your question!",
        content: "Write down your question here whenever your are ready!",
        target: $("#question")[0],
        placement: "top",
        width: "350",

        showNextButton: true
      },
      {
        title: "Let's Chat!",
        content: "Let's start our conversation!",
        target: $("#send")[0],
        placement: "top",
        arrowOffset: 265,
        xOffset: -245,
        showCTAButton: true
      }
    ],
    showPrevButton: true,
    onEnd: () => {
      //change localStorage
      setLocalTourBool(true);
      // if has userToken, update user DB record
      if (hasUserToken()) {

      }
    },
    onClose: () => {
      //change localStorage
      setLocalTourBool(true);
      // if has userToken, update user DB record
      if (hasUserToken()) {

      }
    }
  };

  // check local storage for tour record, if never been decleared
  if (shownTour() === null) {
    setLocalTourBool(false);
  }
  shouldDisplayTour().then(tourBool => {
    if (tourBool) {
      hopscotch.startTour(liteVersionTour);
    }
  })
})

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
