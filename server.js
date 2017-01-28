'use strict';
require('@risingstack/trace'); //for heorku tracking addon
require('./config/console'); //overide global console.log function
global.Promise = require("bluebird");

const http = require('http');
const https = require('https');
const path = require('path');

const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const morgan = require('morgan'); //request logger

const util = require("util");
const cookieParser = require('cookie-parser');


const session = require('express-session');
const multer = require('multer');
const methodOverride = require('method-override');

const flash = require('connect-flash');
const fetch = require('node-fetch');

//libs for user system
const passport = require('passport');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

const server = http.createServer(app);

require('./config/passport')(passport); // pass passport for configuration

require('./app/routes.js')(app, passport); // Routes

require('./app/socket-io.js')(server); //handle communication between client and server

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'))
});

module.exports = app;