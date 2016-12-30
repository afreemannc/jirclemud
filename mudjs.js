var net = require('net');
var mysql = require('mysql');
var colors = require('colors/safe');
var session = require('./session');
global.config = require('./config');
var commands = require('./commands/commands');
var user = require('./user');
var rooms = require('./room');
var classes = require('./classes');
var dice = require('./dice');
var items = require('./items/items');
var prompt = require('./prompt/prompt.js');
var zones = require('./zones');
var tokens = require('./tokens');

global.sockets = [];
global.user = user;
global.mysql = mysql;
global.colors = colors;
global.dice = dice;
global.classes = classes;
global.rooms = rooms;
global.commands = commands;
global.items = items;
global.prompt = prompt;
global.zones = zones;
global.tokens = tokens;

function newSocket(socket) {
  socket.playerSession = new session(socket);
  // TODO: replace this with pooling
  socket.connection = mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    port: config.dbPort,
    debug: ['ComQueryPacket', 'RowDataPacket']
  });
  sockets.push(socket);
  user.start(socket);

  socket.on('data', function (data) {
    parseData(socket, data);
  });

  socket.on('end', function() {
    closeSocket(socket);
  });
}

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(config.port);
global.connection  = mysql.createConnection({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPass,
    database: config.dbName,
    port: config.dbPort
  });
global.rooms.loadRooms();
global.zones.loadZones();
// TODO: move to session object, rely on this.socket as socket is passed during session creation.
function parseData(socket, data) {
  inputContext = socket.playerSession.getInputContext();
  switch (socket.playerSession.inputContext) {
    case 'prompt':
      // certain prompts require collection of multi-line inputs so raw data is provided here.
      socket.playerSession.prompt.promptHandler(data);
      break;
    case 'command':
      // commands should only every be single line so data is sanitized to remove newline characters.
      var input = cleanInput(data);
      commands.commandHandler(socket, input);
      break;
  }
}


/*
 * Cleans the input of carriage return, newline
 */
function cleanInput(data) {
  return data.toString().replace(/(\r\n|\n|\r)/gm,"");
}

function closeSocket(socket) {
  var i = sockets.indexOf(socket);
  if (i !== -1) {
    sockets.splice(i, 1);
  }
}
