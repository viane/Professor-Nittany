'use strict';
var http = require('http');
const https = require('https');
var path = require('path');

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
var app = express();
var server = http.createServer(app);
var root = __dirname;
var speech_to_text_params;
var isVioceFileWritten = true;
var flash    = require('connect-flash');

//libs for user system
var mongoose = require('mongoose');
var passport = require('passport');
var configDB = require('./config/database.js');


// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration
app.configure(function() {
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

  // set up our express application
  app.use(express.logger('dev')); // log every request to the console
  app.use(express.cookieParser()); // read cookies (needed for auth)

  app.set('view engine', 'ejs'); // set up ejs for templating

  // required for passport
  app.use(express.session({ secret: 'intellegent_student_administrtion', maxAge: 360*5 })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

});


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


//speech to text
var speech_to_text = watson.speech_to_text({
  username: 'b0a5aa64-d4c5-48df-8b9e-384a4296cf40',
  password: 'EmIhwoPUhMSC',
  version: 'v1'
});


//for retrive and rank
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

var ranker_id = 'c852c8x19-rank-145', 
  rrquestion;//store user question string

//for conversation tracking
var conversation = watson.conversation({
  username: 'c4aef79a-6610-46f0-b84e-9fb358d28b43',
  password: 'lIZngYurf0YI',
  version: 'v1',
  version_date: '2016-07-11'
});

var dialog_stack = ["root"],
  dialog_turn_counter = 1,
  dialog_request_counter = 1;
  
var pmt = function(str) {
  console.log(str);
}


app.get('/css/*', function(req, res) {
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

app.get('/fonts/*', function(req, res) {
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


app.get('/js/*', function(req, res) {
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

app.get('/img/*', function(req, res) {
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

app.post('/checkRecord', function(req, res) {
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

///////////////////////////////////////////////////
//  Receiving the question                       //
///////////////////////////////////////////////////

app.get("/query", function(req, res) {

  var directCompositQuestion = {
    intent: '',
    entity: '',
    clause: ''
  }

  //user current input
  var currentInput = req.query.input;

  conversation.message({
    input: {
      "text": currentInput
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
    //handling answer part
      //prepare retrive and rank query var
      var rrquery;
      
      //this text is the match condition answer from bluemix conversation dialog
      var conversationResponseText = response.output.text[0]; 
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //     case 1, user asked a complete question, we can directly pass question to retrive and rank              //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if(checkIfStrContains(conversationResponseText, "question:complete") && checkIfStrContains(conversationResponseText, "conversation:end") && checkIfStrContains(conversationResponseText, "goto:rr")){
        //the string user inputed came back from response as well.
        rrquestion = response.input.text;
        //prepare retrive and rank query
         rrquery= qs.stringify({
            q: rrquestion,
            ranker_id: ranker_id,
            fl: 'id,answer_id,score,confidence,title,body'
          });
        //ask retrive and rank
           solrClient.get('fcselect', rrquery, function(err, searchResponse) {
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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //     case 2, user asked a complete question, we can directly pass question to retrive and rank              //
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      
      
      
      // if (checkIfStrContains(conversationResponseText, "question:complete")) { //user asked a complete question
      //   if (checkIfStrContains(conversationResponseText, "goto:rr")) { //flag for retrive and rank
      //     //call retrive and rank to get data from computer science ranker with question: response.input.text
          
      //     // get request from r&r
      //     solrClient.get('fcselect', rrquery, function(err, searchResponse) {
      //       if (err) {
      //         console.log(err);
      //       }
      //       else {
      //         //console.log(JSON.stringify(searchResponse.response.docs, null, 2));
      //         res.send({
      //           "status": 'retrive_and_rank',
      //           "result": searchResponse
      //         });
      //       }
      //     });
      //   }
      // }
      // if (checkIfStrContains(conversationResponseText, "conversation:end") && checkIfStrContains(conversationResponseText, "type:unknown")) { //user might asked a question either complex or out of domain
      
      //     //ask retrive and rank or handle the excpetion
          
      //     //try r&r
      //     solrClient.get('fcselect', rrquery, function(err, searchResponse) {
      //       if (err) {
      //         console.log(err);
      //       }
      //       else {
      //         res.send({
      //           "status": 'retrive_and_rank',
      //           "result": searchResponse
      //         });
      //       }
      //     });
      // }
      // else { //conversation continues
      // if(checkIfStrContains(conversationResponseText,"type:intent")){  //if user asked a major or school but maybe wants to add addtional information to the question
      //   directCompositQuestion.intent = rrquestion;  //forming a compositi question
        
      //   }
      
      // res.send({
      //     "status": 'conversation',
      //     "result": response.output.text
      //   });
      // }
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
  checkRetiveAndRankStatus();  //if error debug this frist
});
