// postExec.js
// this file is used to run function that require running at then end of the ejs document

//////////////////////////////////////////////
// Display question history on profile page
//////////////////////////////////////////////
$(() => {
    if (location.href === "http://localhost:3000/profile" || location.href === "https://intelligent-student-advisor.herokuapp.com/profile") {
      questionHistory.map((logedQuestionObj) => {
        // display user favorited question
        if(logedQuestionObj.favorite){

          let respond = "<li class=\"list-group-item text-left\">"

          //add favorite btn to answer
          respond += "<div id=\"hearts-existing\" class=\"hearrrt\" data-toggle=\"tooltip\" data-container=\"body\" data-placement=\"right\" title=\"Favorite!\" data-favortite = \"true\"></div>";

          //add answer body and
          respond += "<div class=\"question-log-question-body\"><p class=\"question-body\">" + logedQuestionObj.question_body + "</p></div>";

          respond += "</li>"

          $('#asked-question-list').append(respond);
        }
      })

      // enable heart icon functionality
      $(".hearrrt").hearrrt();

      // mannual mark up each favorite question
      $('.hearrrt span').each(function(){$(this).click()});
    }
})
