'use strict'

const config = require('../../config');
const watson = require('watson-developer-cloud');

let dialog_stack = ["root"],
    dialog_turn_counter = 1,
    dialog_request_counter = 1;

const conversation = watson.conversation(config.watson.conversation);



exports.questionCheck = (inputText,context) =>{
    return new Promise((resolve, reject) => {
        conversation.message({
        workspace_id: 'edae601d-c944-4187-9d3f-92b01caaa18c',
        input: {'text': inputText},
        context: context
        }, function(err, response){
            if (err)
                reject(err);
            else
                context = response.context;
                resolve(response);
        });
    });
}

exports.isInDomain = (inputText)=> {
    return new Promise((resolve, reject) =>{
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
                console.error('error:', err);
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

exports.askSEWorldCampusSchedule = (inputText)=> {
    return new Promise((resolve, reject) =>{
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
            workspace_id: 'f1398377-2d99-4f4a-88aa-91ad8730fe59'
        }, function(err, response) {
            if (err) {
                console.error('error:', err);
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
