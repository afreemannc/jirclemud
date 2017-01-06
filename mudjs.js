var net = require('net');
global.mysql = require('mysql');
Session = require('./session');
Config = require('./config/config.js');
Commands = require('./core/commands');
Characters = require('./core/characters');
global.rooms = require('./room');
global.classes = require('./classes');
global.items = require('./core/items');
Prompt = require('./core/prompt');
global.zones = require('./zones');
Tokens = require('./core/tokens');
Containers = require('./containers');

Sessions = [];

function newSocket(socket) {

  var session = Session.new();

  socket.on('data', function (data) {
    parseData(session, data);
  });

  socket.on('end', function() {
    closeSession(session);
  });

  session.socket = socket;
  Sessions.push(session);
  session.start();
}

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(Config.port);

// Create a pool of db connections for later use.
global.dbPool = mysql.createPool({
    connectionLimit: 10,
    host: Config.dbHost,
    user: Config.dbUser,
    password: Config.dbPass,
    database: Config.dbName,
    port: Config.dbPort
});

global.rooms.loadRooms();
global.zones.loadZones();
// TODO: move to session object, rely on this.socket as socket is passed during session creation.
function parseData(session, data) {
  inputContext = session.getInputContext();
  switch (session.inputContext) {
    case 'prompt':
      // certain prompts require collection of multi-line inputs so raw data is provided here.
      session.prompt.promptHandler(data);
      break;
    case 'command':
      // commands should only every be single line so data is sanitized to remove newline characters.
      var input = cleanInput(data);
      Commands.commandHandler(session, input);
      break;
  }
}

/*
 * Cleans the input of carriage return, newline
 */
function cleanInput(data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

function closeSession(session) {
  var i = Sessions.indexOf(session);
  if (i !== -1) {
    Sessions.splice(i, 1);
  }
}
