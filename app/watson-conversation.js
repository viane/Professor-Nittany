var watson = require('watson-developer-cloud');

var dialog_stack = ["root"],
    dialog_turn_counter = 1,
    dialog_request_counter = 1;

var conversation = watson.conversation({username: '2b2e38a3-e4b9-4602-a9eb-8be58f235fca', password: 'YXyHpjWJXbLf', version: 'v1', version_date: '2016-07-11'});

exports.enterMessage = function(inputText) {
    return new Promise(function(resolve, reject) {
        conversation.message({
            input: {
                "text": inputText
            },
            context: {
                "conversation_id": "1",
                "system": {
                    "dialog_stack": dialog_stack,
                    "dialog_turn_counter": dialog_turn_counter,
                    "dialog_request_counter": dialog_request_counter
                }
            },
            workspace_id: '67c7c32c-453d-47b5-b942-2f1ee76ffa77'
        }, function(err, response) {
            if (err) {
                console.log('error:', err);
                reject(err);
            } else {
                //update dialog path
                dialog_stack = response.context.system.dialog_stack;
                dialog_turn_counter = response.context.system.dialog_turn_counter;
                dialog_request_counter = response.context.system.dialog_request_counter;
                //handling answer part
                resolve(response.output.text);
            }
        });
    });
}
