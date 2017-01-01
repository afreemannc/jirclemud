var net = require('net');
var mysql = require('mysql');
global.colors = require('colors/safe');
global.session = require('./session');
global.config = require('./config');
global.commands = require('./commands/commands');
global.characters = require('./characters');
global.rooms = require('./room');
global.classes = require('./classes');
global.dice = require('./dice');
global.items = require('./items/items');
global.prompt = require('./prompt/prompt.js');
global.zones = require('./zones');
global.tokens = require('./tokens');
global.containers = require('./containers');

global.sessions = [];

function newSocket(socket) {

  var session = global.session.new();

  socket.on('data', function (data) {
    parseData(session, data);
  });

  socket.on('end', function() {
    closeSession(session);
  });

  session.socket = socket;
  global.sessions.push(session);
  session.start();
}

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(config.port);

// Create a pool of db connections for later use.
global.dbPool = mysql.createPool({
    connectionLimit: 10,
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    port: config.dbPort
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
      global.commands.commandHandler(socket, input);
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
  var i = global.sessions.indexOf(session);
  if (i !== -1) {
    global.sessions.splice(i, 1);
  }
}
