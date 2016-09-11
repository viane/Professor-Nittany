'use strict';
var http = require('http');
const https = require('https');
var path = require('path');

var async = require('async');
var express = require('express');
var Str = require('string');
var fs = require('fs');
var bodyParser = require('body-parser');
var watson = require('watson-developer-cloud');
var qs = require('qs'); //  Use a querystring parser to encode output.
var crypto = require('crypto');

var formidable = require('formidable');
var userVoiceFileName, userVoiceFilePath = "./audio/";
var util = require("util");
var router = express();
var server = http.createServer(router);
var root = __dirname;
var speech_to_text_params;
var isVioceFileWritten = true;


router.use(bodyParser.json({
  limit: '50mb'
}));
router.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));


var conversation = watson.conversation({
  username: 'c4aef79a-6610-46f0-b84e-9fb358d28b43',
  password: 'lIZngYurf0YI',
  version: 'v1',
  version_date: '2016-07-11'
});

var speech_to_text = watson.speech_to_text({
  username: 'b0a5aa64-d4c5-48df-8b9e-384a4296cf40',
  password: 'EmIhwoPUhMSC',
  version: 'v1'
});


var retrieve_and_rank = watson.retrieve_and_rank({
  username: '55076b34-3f2b-48e4-9d6f-9abd9ac92ce2',
  password: 'DtRHd7eq6Cs6',
  version: 'v1'
});

var rrparams = {
  cluster_id: 'sc854a5c9f_416b_40d5_b471_00c90a0dc3d8',
  collection_name: 'behrend'
};

var solrClient = retrieve_and_rank.createSolrClient(rrparams);

var ranker_id = 'c852c8x19-rank-145', rrquestion;


var pmt = function(str) {
  console.log(str);
}

router.get('/', function(req, res) {
  fs.readFile('index.html', 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    res.status(200).send(data);
  });
});

router.get('/css/*', function(req, res) {
  res.sendfile(req.path, {
    'root': root
  }, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', req.path);
    }
  });
});

router.get('/fonts/*', function(req, res) {
  res.sendfile(req.path, {
    'root': root
  }, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', req.path);
    }
  });
});

router.get('/fonts/*', function(req, res) {
  res.sendfile(req.path, {
    'root': root
  }, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', req.path);
    }
  });
});

router.get('/js/*', function(req, res) {
  res.sendfile(req.path, {
    'root': root
  }, function(err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', req.path);
    }
  });
});

router.get('/img/*', function(req, res) {
  res.sendfile(req.path, {
    'root': root
  }, function(err) {
    if (err) {
      pmt(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', req.path);
    }
  });
});

router.post('/checkRecord', function(req, res) {
  //generate a random uservoice file name
  userVoiceFileName = new Date().getTime().toString();
  userVoiceFileName = crypto.createHash('md5').update(userVoiceFileName).digest("hex") + ".wav";
  var form = new formidable.IncomingForm(),
    fields = [],
    files = [];

  form.on('fileBegin', function(name, file) {

    file.path = userVoiceFilePath + userVoiceFileName;
    isVioceFileWritten = false;
  });
  form.on('error', function(err) {
    res.writeHead(200, {
      'content-type': 'text/plain'
    });
    res.end('error:\n\n' + util.inspect(err));
  });

  form.on('field', function(field, value) {
    fields.push([field, value]);
  });

  form.on('file', function(field, file) {
    files.push([field, file]);
  });
  form.on('end', function() {
    // res.writeHead(200, {'content-type': 'text/plain'});
    // res.write('Received fields:\n\n ' + util.inspect(fields));
    // res.write('\n\n');
    // res.end('received files:\n\n ' + util.inspect(files));
    isVioceFileWritten = true;
    pmt('file wrote');
  });

  form.encoding = 'utf-8';
  form.uploadDir = './audio';
  form.keepExtensions = true;
  form.parse(req);
  //check user voice file is finish written every half second
  var interval = setInterval(function() {
    pmt("Checking if the voice file is written to the disk...")
    fs.access(userVoiceFilePath + userVoiceFileName, fs.F_OK, function(err) {
      if (!err && isVioceFileWritten) {
        pmt("Found voice file...")
        clearInterval(interval);
        setTimeout(function() {
          //speech to text call
          speech_to_text_params = {

            audio: fs.createReadStream(userVoiceFilePath + userVoiceFileName),
            content_type: 'audio/wav',
            timestamps: true,
            word_alternatives_threshold: 0.9,
            continuous: true
          };

          speech_to_text.recognize(speech_to_text_params, function(error, transcript) {
            if (error) {
              console.log('error:', error);
              res.send(error);
            }
            else {
              res.send(transcript);
              console.log(JSON.stringify(transcript, null, 2));
              fs.unlinkSync(userVoiceFilePath + userVoiceFileName);
            }
          });
        }, 100);


      }
      else {
        // It isn't accessible
        //keep waitting
      }
    });
  }, 500);

});


var dialog_stack = ["root"],
  dialog_turn_counter = 1,
  dialog_request_counter = 1;

router.get("/query", function(req, res) {
  pmt(dialog_stack);
  pmt(dialog_turn_counter);
  pmt(dialog_request_counter);

  var directCompositQuestion = {
    intent: '',
    entity: '',
    clause: ''
  }

  var queryQuestion = req.query.input;

  conversation.message({
    input: {
      "text": queryQuestion
    },
    context: {
      "conversation_id": "1",
      "system": {
        "dialog_stack": dialog_stack,
        "dialog_turn_counter": dialog_turn_counter,
        "dialog_request_counter": dialog_request_counter
      }
    },
    workspace_id: 'fdbbfec3-49dd-4952-aa14-4dd7fe7cdbc0'
  }, function(err, response) {
    if (err) {
      console.log('error:', err);
    }
    else {
      var answer = JSON.stringify(response, null, 2);
      var conversationResponseText = response.output.text[0];
      rrquestion = response.input.text;
      var query = qs.stringify({
            q: rrquestion,
            ranker_id: ranker_id,
            fl: 'id,answer_id,score,confidence,title,body'
          });
      if (checkIfStrContains(conversationResponseText, "question:complete")) { //user asked a complete question
        if (checkIfStrContains(conversationResponseText, "goto:rr")) { //flag for retrive and rank
          //pmt("call retrive and rank to get data from computer science ranker with question: " + response.input.text + "\n");
          
          // get request from r&r
          solrClient.get('fcselect', query, function(err, searchResponse) {
            if (err) {
              console.log(err);
            }
            else {
              //console.log(JSON.stringify(searchResponse.response.docs, null, 2));
              res.send({
                "status": 'retrive_and_rank',
                "result": searchResponse
              });
            }
          });
        }
      }
      if (checkIfStrContains(conversationResponseText, "conversation:end") && checkIfStrContains(conversationResponseText, "type:unknown")) { //user might asked a question either complex or out of domain
      
          //ask retrive and rank or handle the excpetion
          
          //try r&r
          solrClient.get('fcselect', query, function(err, searchResponse) {
            if (err) {
              console.log(err);
            }
            else {
              res.send({
                "status": 'retrive_and_rank',
                "result": searchResponse
              });
            }
          });
      }
      else { //conversation continues
      if(checkIfStrContains(conversationResponseText,"type:intent")){  //if user asked a major or school but maybe wants to add addtional information to the question
        directCompositQuestion.intent = rrquestion;  //forming a compositi question
        
        }
      
      res.send({
          "status": 'conversation',
          "result": response.output.text
        });
      }
      //update dialog path
      dialog_stack = response.context.system.dialog_stack;
      dialog_turn_counter = response.context.system.dialog_turn_counter;
      dialog_request_counter = response.context.system.dialog_request_counter;
    }
  });


});

var checkIfStrContains = function(originalStr, comparedStr) {
  if (originalStr.indexOf(comparedStr) > -1)
    return true;
  else
    return false;
}

var checkRetiveAndRankStatus = function() {
  retrieve_and_rank.pollCluster({
      cluster_id: 'sc854a5c9f_416b_40d5_b471_00c90a0dc3d8'
    },
    function(err, response) {
      if (err)
        console.log('error:', err);
      // else
      //   console.log(JSON.stringify(response, null, 2));
    });

  var param = {
    ranker_id: '1ba90fx17-rank-599'
  };

  retrieve_and_rank.rankerStatus(param,
    function(err, response) {
      if (err)
        console.log('error:', err);
      //else
      //console.log(JSON.stringify(response, null, 2));
    });
}


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
  checkRetiveAndRankStatus();
});
