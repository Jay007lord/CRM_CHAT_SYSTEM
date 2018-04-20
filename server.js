const http = require('http'); //http required for server side
const app = require('./app'); //app is defined so all the required routes and some cores module are defined there
const config = require('./config/index'); //config for configure mongodb
const connectMongo = require('./config/mongo'); //mongoose is defined there
const log = require('./log'); //log is used for logging error or success reply with status code on web
const io = require('./chat/io'); //Socket.io backend chat is defined here


const server = http.createServer(app); //server is created

// connect to  mongoose service
connectMongo();
io(server); //io listening to server

// start server
server.listen(config.server.port, (err) => {
  if (err) {
    log.err('server', 'could not start listening', err.message || err);
    process.exit();
  }
  log.log('env', `web system is running on "${config.env}" mode...`);
  log.log('server', `Express server is listening on ${config.server.port}...`);
});
