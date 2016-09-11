/*global $*/
var myvar;

var chatWindow=$('.chat-thread');
$('#querySubmitBtn').click(function() {
    var self=$(this);
    setTimeout(function() {
        self.addClass('loading');
    }
    , 125);
    var inputQuery=$('#userQueryInput').val();
    chatWindow.append("<li class='user'><p>"+ inputQuery+ "</p></li>");
    $('#userQueryInput').val("");
    scrollChatWindowToBottom();
    $.ajax( {
        url: '/query', type: 'get', data: {
            "input": inputQuery
        }
        , success: function(data) {
            setTimeout(function() {
                self.removeClass('loading');
            }
            , 125);
            var respond="<li class='agent'>";
            console.log(data);
            if(data.status=="conversation"){//from conversation
                for (var i=0;i < data.result.length;i++) {
                    respond+="<p>"+ data.result[i]+ "</p>";
                }
            }else{
                respond+="<p>"+ data.result.response.docs[0].body+ "</p>";
            }
            respond+="</li>";
            chatWindow.append(respond);
            scrollChatWindowToBottom();
            $('#userQueryInput').focus();
        }
    }
    );
});

//submit question when user press enter during typing
$('#userQueryInput').keypress(function(e){
     if (e.keyCode == 13) {
         e.preventDefault();
         if($(this).val().length>=2){
        $('#querySubmitBtn').click();
         }
        return false;
    }
})

$('#voiceSubmitBtn').click(function() {
    //toggleRecording(this);
    if ($(this).hasClass("recording")) {
        // stop recording
        audioRecorder.stop();
        $(this).removeClass("recording");
        audioRecorder.getBuffers(gotBuffers);
        //notify user app is transcripting voice
        hideNotification();
        showAnimateTranscripting(); //notify voice is being transcripted
    }
    else {
        // start recording
        if (!audioRecorder) return;
        $(this).addClass("recording");
        audioRecorder.clear();
        audioRecorder.record();
        showNotification("Click record button again when finish speaking");
        setTimeout(function() {
            $('#userQueryInput').val("");
        }
        , 200);
    }
}

);
var showNotification=function(msg) {
    $('.notification span').text(msg);
    $('.notification').css('display', 'block');
    $('.notification').animate( {
        opacity: 1
    }
    , 100);
}

var hideNotification=function() {
    $('.notification span').text("");
    $('.notification').animate( {
        opacity: 0
    }
    , 200, function() {
        $('.notification').css('display', 'none');
    }
    )
}

var showAnimateTranscripting=function() {
    var text=$(".transcripting_loading_span");
    var dots=$(".dot");
    text.css('display', 'block');
    text.animate( {
        opacity: 1
    }
    , 1200);
    dots.each(function() {
        $(this).css('display', 'block');
        $(this).animate( {
            opacity: 1
        }
        , 1200);
    }
    )
}

var hideAnimateTranscripting=function() {
    var text=$(".transcripting_loading_span");
    var dots=$(".dot");
    text.animate( {
        opacity: 0
    }
    , 100, function() {
        text.css('display', 'none');
    }
    );
    dots.each(function() {
        $(this).animate( {
            opacity: 0
        }
        , 100, function() {
            $(this).css('display', 'none');
        }
        );
    }
    )
}

var scrollChatWindowToBottom=function() {
    $(".chat-thread").animate( {
        scrollTop: $(".chat-thread").height()
    }
    , 800);
}