//Noty lib for global notification
var generateNotice = function(type, text, timeout) {
  if(timeout === undefined){
    timeout = 2500; //default message out time
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
            speed: 1200,

        }
    });
    console.log("timeout: ", timeout);
    n.setTimeout(timeout);
};

////////////////////////////////////////////////////////
//toggle vew section in question manage page
////////////////////////////////////////////////////////

var trigerIDArray =["view_question_btn","add_question_btn","analysis_question_btn"];  //need get this dynamically
var targetIDArray =["viewQuestionSection","addQuestionSection","analysisQuestionSection"]; //need get this dynamically

var hideShowElementByIDOnClick = function(triger, target) {
    $("#" + target).css("display","none");
    $("#" + triger).click(function() {
        //get index of target want to show
        var showIndex = trigerIDArray.indexOf(triger);
        //hide all other elements by exclude this index
        $(targetIDArray).each(function(index,value){
            if(index!=showIndex){
               $("#"+value).hide(400);
            }
        })
        //toggle our target
        $("#" + target).toggle(500);
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
    }, 1)
}

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
});
