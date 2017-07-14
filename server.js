'use strict';

const opbeat = require('opbeat'); // tracing new release
global.Promise = require("bluebird");

const morgan = require('morgan'); //request logger
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

// for system status functions
const systemStatus = require(appRoot + '/app/system-status');

// customize console.log font color
const logColor = require('colors');

app.use(opbeat.middleware.express()); // opbeat for heroku monitoring

app.use(bodyParser.json({
    limit: '50mb',
    parameterLimit: 10000,
    limit: 1024 * 1024 * 10,
    extended: true
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 10000,
    limit: 1024 * 1024 * 10
}));

// set up our express application
// all environments
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
const _session = session({
    secret: 'intellegent academic planner',
    maxAge: 3600000,
    resave: true,
    cookie: {
        maxAge: 3600000
    },
    saveUninitialized: true
});
app.use(_session);

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

// loading questionFeeds from Disk
serverStatus.initQuestionFeeds().then((result) => {
    console.log("√ Success loaded question feeds".green);
}).catch((err) => {
    throw err
})

// loading KnowledgeDomain from Disk
systemStatus.initGetKnowledgeDomain().then((result) => {
    console.log("√ Success loaded knowledge domain terms".green);
}).catch((err) => {
    throw err
});

server.listen(app.get('port') || 3000,function() {
    console.log(('√ Server listening on port ' + app.get('port')).green)
});

module.exports = app;
