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
var io = require('socket.io').listen(server);

var root = __dirname;
var speech_to_text_params;
var isVioceFileWritten = true;
var flash = require('connect-flash');

//libs for user system
var mongoose = require('mongoose');
var passport = require('passport');
var configDB = require('./config/database.js');

//override console.log function to log to /debug.log and console
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

//library for NLP
var natural = require('natural');
var tokenizer = new natural.WordTokenizer(); //default tokenizer, ignore special characters
var domainBank = ["computer science", "software enginerring", "algorithm","security","cyber","programing","coding"];

// configuration ===============================================================
mongoose.connect(configDB.userDB_URL); // connect to our database

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
  app.use(express.session({
    secret: 'intellegent_student_administrtion',
    maxAge: 360 * 5
  })); // session secret
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
  rrquestion; //store user question string

//for conversation tracking
var conversation = watson.conversation({
  username: '2b2e38a3-e4b9-4602-a9eb-8be58f235fca',
  password: 'YXyHpjWJXbLf',
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

  //query for retrieve and rank
  var rrquery;

  //****************************************************
  //    testing retrieve and rank only                **
  //****************************************************

  // rrquestion = currentInput;
  // //prepare retrive and rank query
  // rrquery = qs.stringify({
  //   q: rrquestion,
  //   ranker_id: ranker_id,
  //   fl: 'id,answer_id,score,confidence,title,body'
  // });
  // //ask retrive and rank
  // solrClient.get('fcselect', rrquery, function(err, searchResponse) {
  //   if (err) {
  //     console.log(err);
  //   }
  //   else {
  //     res.send({
  //       "status": 'retrive_and_rank',
  //       "result": searchResponse
  //     });
  //   }
  // });






});


//Socket.io handle user's input

io.on('connection', function (socket) {
  var user={};

  //when user init a socket from client side, record the suer id and type for security purpose
  socket.on('load',function(data) {
      user.id=data.id;
      user.type=data.type;
      //console.log("User connected thru a socket: " + JSON.stringify(user));
  })

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    //if is login user
    if(user.id && user.type){
      if(user.id===data.sender.id && user.type === data.sender.type){
        //analysis and log inputs
        //console.log("Sender info: " + JSON.stringify(data));

        ///////////////////////////////////////////////////////
        //check inputs corraltion to our domain's perspectives
        ///////////////////////////////////////////////////////
        //natural.PorterStemmer.attach(); //init attaching tokenizeAndStem() and stem() to string
        var inputTokens = tokenizer.tokenize(JSON.stringify(data.content)); //extrac and only take stem of each word
        console.log("input tokens are : " + inputTokens);
        var maxCorrlation = 0, maxInputCorraltionIndex=0,maxDomainCorraltionIndex=0;
        for (var i = inputTokens.length - 1; i >= 0; i--) {
          for (var b = domainBank.length - 1; b >= 0; b--) {
            var tempCorrlation = natural.JaroWinklerDistance(inputTokens[i],domainBank[b]); //measure the distance of each word vs domain bank
            if(maxCorrlation < tempCorrlation){
              maxCorrlation = tempCorrlation;
              maxInputCorraltionIndex = i;
              maxDomainCorraltionIndex = b;
            }

            //Respond by telling the client to execute 'new message'
            socket.emit('new message', {
              message: "Checking corraltion with " + inputTokens[i] + " and " + domainBank[b]
            });
          }
        }
        socket.emit('new message', {
          message: "The best match of corrlation is : " + inputTokens[maxInputCorraltionIndex] + " and " + domainBank[maxDomainCorraltionIndex] + " with value : " + maxCorrlation
        });

      }
    }else{
      //default method for visitor's input
      console.log("Visitor sent a message : " + JSON.stringify(data))

      var currentInput = JSON.stringify(data);

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
        workspace_id: '67c7c32c-453d-47b5-b942-2f1ee76ffa77'
      }, function(err, response) {
        if (err) {
          console.log('error:', err);
        }
        else {
        //handling answer part
        socket.emit('new message', {
          message: response.output.text
        });
          //update dialog path
          dialog_stack = response.context.system.dialog_stack;
          dialog_turn_counter = response.context.system.dialog_turn_counter;
          dialog_request_counter = response.context.system.dialog_request_counter;
        }
      });
    }

    //tempare ask conversation


  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
      console.log("A user disconnected socket connection");
      // echo globally that this client has left
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
  checkRetiveAndRankStatus(); //if error debug this frist
});
