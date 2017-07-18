let data = ["test1", "test2", "test3", "test4"];

$(document).ready(function() {
    // when user presses the send button
    $('#send').click(function(){
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
});

// when the user wants to see more answers, they can click on the buttons
// this makes sure that the data is changed
$(document).on('click', ':button', function (e) {
    $('.active').removeClass('active')
    $(this).addClass('active');
    $('.media-watson-info .current-message').text(data[this.id]);
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
        time = hour - 12 + ':' + minutes + 'pm';
    else
        time = hour + ':' + minutes + 'am';
    
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

// Just to condense the append functions
// it's to make sure all of the messages stay consistant
let htmlBefore = '<li class="media"><div class="media-body row"><div class="pull-right"><img class="media-object img-circle " src="images/default-user.png"></div><div class="media-user-info">';
let htmlWBefore = '<li class="media"><div class="media-body row"><div class="pull-left"><img class="media-object img-circle " src="images/logo.png"></div><div class="media-watson-info"><p class="media-text current-message">';
let htmlAfter = '</small></div></div></div></li>';
let htmlButtons = '<div class="btn-group other-answers" role="group" aria-label="...">' + 
                  '<button type="button" class="btn btn-default active" id="0">First</button>' +
                  '<button type="button" class="btn btn-default" id="1">Second</button>' +
                  '<button type="button" class="btn btn-default" id="2">Third</button>' + 
                  '<button type="button" class="btn btn-default" id="3">Fourth</button></div>';
let htmlWAfter = '</small></div></div></div>' + htmlButtons + '</li>';

// This adds the user input to the chat and sends it to server for response
function addUserChat() {
    let question = {};
    question.title = $('#question').val();
    let date = getDateAndTime();

    // Regex checks if the string sent isn't only spaces
    if (/\S/.test(question.title)) {
        $('#chat').append(htmlBefore + question.title + '<br><small class="text-muted">You | ' + getDateAndTime() + htmlAfter);

        //sendServerQuestion(question.title);
        //getDataFromServer();
        test();

        $('.current-chat-area').animate({scrollTop: $(".scroll-chat").height()});
    }
    // Clears value in input field
    $('#question').val('');
}

function test() {
    $('.current-message').attr('class', 'media-text');
    $('.other-answers').remove();
    let data = 'This is just a test<br>';

    $('#chat').append(htmlWBefore + data + '</p><small class="text-muted">Watson | ' + getDateAndTime() + htmlWAfter);
}