var net = require('net');
var mysql = require('mysql');
var session = require('./session');
var config = require('./config');
var user = require('./user');
var commands = require('./commands');
console.log(config);
var sockets = [];

var connection = mysql.createConnection({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
});

//connection.connect();

function newSocket(socket) {
  socket.playerSession = new session();

  sockets.push(socket);

  socket.write('Welcome to ' + config.mudName + "\n");
  // display splash screen
  socket.write("[L]ogin or [C]reate a character\n");

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

function loginHandler(socket, input) {
  user.login(socket, input);
}

function characterCreationHandler(socket, input) {
  socket.write('character mode initiated');
  console.log(socket.playerSession);
  user.create(socket, input);
}



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
      loginHandler(socket, input);
      break;
    case 'character':
      characterCreationHandler(socket, input);
      break;
    case 'command':
      commandHandler(socket, input);
      break;
    default:
      modeSelect(socket, input);
      break;
  }
}

function modeSelect(socket, input) {
  if (socket.playerSession.mode === false) {
    if (input === 'l') {
      socket.playerSession.mode = 'login';
      loginHandler(socket, true);
    }
    else if  (input === 'c') {
      socket.playerSession.mode = 'character';
      characterCreationHandler(socket, true);
    }
    else {
      socket.write(input + ' is not a valid option\n');
      socket.write("[L]ogin or [C]reate a character\n");
    }
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
  if (i != -1) {
    sockets.splice(i, 1);
  }
}
