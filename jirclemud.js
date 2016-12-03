var net = require('net');
var mysql = require('mysql');
var session = require('./session');
var config = require('./config');
var user = require('./user');
var commands = require('./commands');

var sockets = [];

var connection = mysql.createConnection({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database: config.dbName,
  port: config.dbPort
});

connection.connect();

function newSocket(socket) {
  socket.playerSession = new session(socket, user);

  sockets.push(socket);

  socket.write('Welcome to ' + config.mudName + "\n");
  // display splash screen
  socket.playerSession.mode = 'start';
  socket.playerSession.prompt("[L]ogin or [C]reate a character\n", 'start');


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

function commandHandler(socket, inputRaw) {
  var commandSegments = inputRaw.split(' ');
  var command = commandSegments[0];
  commandSegments.splice(0, 1);
  console.log(typeof commandSegments);
  console.log('length:' + commandSegments.length);
  console.log(commandSegments);
  socket.write('Command received:' + inputRaw);
  if (typeof commands[command]  === 'function') {
    commands[command](socket, commandSegments);
  }
  else {
     socket.write('wut\n');
  }
}

function parseData(socket, data) {
  var input = cleanInput(data);
  switch (socket.playerSession.mode) {
    case 'login':
      user.login(socket, input);
      break;
    case 'character':
      user.create(socket, connection, input);
      break;
    case 'command':
      commandHandler(socket, input);
      break;
    default:
      socket.playerSession.modeSelect(input);
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
