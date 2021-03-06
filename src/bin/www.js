'use strict'

/**
 * Module dependencies.
 */
require('@risingstack/trace');
import "babel-polyfill";
const app = require('../app');
const debug = require('debug')('rest-server:server');
const http = require('http');
//const https = require('https');
const fs = require('fs');
const opbeat = require('opbeat').start({
  appId: '813f711937',
  organizationId: '5ea731d93ff346b1ad13fb8ddc6ea8bd',
  secretToken: '5646d3dc59d3ead94d5429ca17d70b112bf0a6cf'
})
import socketIO from '../routes/socket.io';
app.use(opbeat.middleware.express())

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');

app.set('port', port);
app.set('secPort',port+443);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Socket.IO
 */
const io = require('socket.io')(server);
socketIO(io);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, function() {
   console.log('Server listening on port ',port);
});
server.on('error', onError);
server.on('listening', onListening);

// /**
//  * Create HTTPS server.
//  */ const options = {
//   key: fs.readFileSync(__dirname+'/private.key'),
//   cert: fs.readFileSync(__dirname+'/certificate.pem')
// };

// const secureServer = https.createServer(options,app);

// *
//  * Listen on provided port, on all network interfaces.


// secureServer.listen(app.get('secPort'), function() {
//    console.log('Server listening on port ',app.get('secPort'));
// });
// secureServer.on('error', onError);
// secureServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
