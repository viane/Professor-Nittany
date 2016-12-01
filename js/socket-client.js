$(function() {
  // Initialize variables
  var $window = $(window);
  //var $usernameInput = $('.usernameInput'); // Input for username
  //var $messages = $('.messages'); // Messages area

  var user={};
  user.id = $("#user-id").text().trim(); //assgin user id
  user.type = $("#user-type").text().trim(); //assgin user type
  
  var socket = io();

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  

  // Socket events

  // on page load, send server the user info of init the socket
  socket.emit('load', user);

  // when server send back a message
  socket.on('new message', function (data) {
    //addChatMessage(data);
    console.log("server received your data and sent to you:");
    console.log(JSON.stringify(data));
  });

  // send message to server by use emit api form socket io
  $('#querySubmitBtn').click(function () {
    var $inputMessage = $('#userQueryInput'); // Input message input box

    // Prevent markup from being injected into the message
    var message = {};
    message.sender={};
    if($("#user-id").text().trim()) message.sender.id=$("#user-id").text().trim();
    if($("#user-type").text().trim()) message.sender.type = $("#user-type").text().trim(); 
    if(cleanInput($inputMessage.val())) message.content = cleanInput($inputMessage.val());
    
    // if there is a non-empty message and a socket connection
    if (message.content) {
      $inputMessage.val('');
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  });

});
