'use strict';

require('@risingstack/trace'); //for heorku tracking addon

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
var morgan = require('morgan'); //request logger

var util = require("util");
var cookieParser = require('cookie-parser');
var app = express();

var session = require('express-session');
var multer = require('multer');
var methodOverride = require('method-override');
var root = __dirname;
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
mongoose.Promise = global.Promise;
mongoose.connect(configDB.userDB_URL); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

  app.use(bodyParser.json({
    limit: '50mb'
  }));
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  }));

  // set up our express application
  // all environments
  app.use(morgan('dev')); // log every request to the console
  app.use(cookieParser()); // read cookies (needed for auth)

  app.set('view engine', 'ejs'); // set up ejs for templating

  // required for passport
  app.use(session({
    secret: 'intellegent_student_administrtion',
    maxAge: 360 * 1000,
    resave: true,
    saveUninitialized: true
  }));
  // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  app.set('port', process.env.PORT || 3000);
  app.use(methodOverride());

  app.use(express.static(path.join(__dirname, 'views')));


// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

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

var conversation = watson.conversation({
  username: '2b2e38a3-e4b9-4602-a9eb-8be58f235fca',
  password: 'YXyHpjWJXbLf',
  version: 'v1',
  version_date: '2016-07-11'
});

var dialog_stack = ["root"],
  dialog_turn_counter = 1,
  dialog_request_counter = 1;



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


var server = http.createServer(app);
require('./app/socket-io.js')(server,watson);
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
});
