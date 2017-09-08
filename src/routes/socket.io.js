import clientCount from '../models/client-count';
import schedule from 'node-schedule';
let maxConnectedUser = 0; // track current max connected clients

export default(io) => {
  io.on('connection', function(socket) {
    const currentConnectedClient = getConnectedClients(io);
    socket.broadcast.emit('connected client change', {count: currentConnectedClient});
    socket.on('disconnect', function() {
      const currentConnectedClient = getConnectedClients(io);
      socket.broadcast.emit('connected client change', {count: currentConnectedClient});
    })
  })

  logConnectedClients();
}

const getConnectedClients = (io) => {
  const currentConnectedClientCount = Object.keys(io.sockets.sockets).length;
  if (maxConnectedUser < currentConnectedClientCount) {
    maxConnectedUser = currentConnectedClientCount
  }
  return currentConnectedClientCount;
}

const logConnectedClients = () => {
  // every hour log connected clients count
  schedule.scheduleJob('0 * * * *', () => {
    // maxConnectedUser
    const log = new clientCount();
    log.count = maxConnectedUser;
    log.save().then((newDoc) => {
      console.log('Logged hourly connected clients count: ', newDoc.count);
      // clear count
      maxConnectedUser = 0;
    }).catch(err => {
      console.error(err)
      // clear count
      maxConnectedUser = 0;
    })
  })
}
