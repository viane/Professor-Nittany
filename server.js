'use strict';

const morgan = require('morgan'); //request logger

require('@risingstack/trace'); //for heorku tracking addon

require('./config/console'); //overide global console.log function

global.Promise = require("bluebird");

const opbeat = require('opbeat');
const http = require('http');
const https = require('https');
const path = require('path');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const util = require("util");
const cookieParser = require('cookie-parser');

const appRoot = require('app-root-path');

const session = require('express-session');
const methodOverride = require('method-override');

const flash = require('connect-flash');

// libs for user system
const passport = require('passport');

// for server status functions
const serverStatus = require(appRoot + '/app/server-status');

app.use(opbeat.middleware.express()); // opbeat for heroku monitoring

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// set up our express application
// all environments
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'intellegent student planner',
    maxAge: 3600000,
    resave: true,
    cookie: {
        maxAge: 3600000
    },
    saveUninitialized: true
}));
// session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('port', process.env.PORT || 3000);
app.use(methodOverride());

app.use(express.static('views/FrontEnd'));

const server = http.createServer(app);

require(appRoot + '/config/passport')(passport); // pass passport for configuration

require(appRoot + '/app/routes.js')(app, passport); // Routes

require(appRoot + '/app/socket-io.js')(server); //handle communication between client and server

serverStatus.initQuestionFeeds().then((result) => {
    console.log("Success loaded question feeds from server");
}).catch((err) => {
    throw err
}) // loading questionFeeds from Disk

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'))
});

module.exports = app;

const personality = require('./app/personality-insights');
