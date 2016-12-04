var rooms = require('./room');

module.exports.commandHandler = function(socket, inputRaw, connection) {
  var commandSegments = inputRaw.split(' ');
  var command = commandSegments[0];
  console.log('command:' + command + ':');
  commandSegments.splice(0, 1);
  console.log(typeof commandSegments);
  console.log('length:' + commandSegments.length);
  console.log(commandSegments);
  socket.write('Command received:' + inputRaw);
  if (typeof commands[command]  === 'function') {
    if (command === 'create') {
      console.log('create detected');
      var args = connection;
    }
    else {
      console.log('not create');
      var args = false;
    }
    commands[command](socket, commandSegments, args);
  }
  else {
     socket.write('wut\n');
  }
}

module.exports.quit = function(socket) {
   socket.end('Goodbye!\n');
}

module.exports.look = function(socket, input) {
    // Room look
    if (input.length === 0) {
      socket.write('room desc');
    }
    else {
      // does thing exist?
      // if so retrieve description and print
      socket.write('item desc');
    }
}

module.exports.get = function(socket, input) {
    if (input.length === 0) {
      socket.write('Get what??\n');
    }
    else {
    // does thing exist?
    // can it be gotten?
       // CARRY flag?
       // Weight vs character lift?
       // Room in carry inventory?
    // if so transfer item from current location to carry inventory
    socket.write('You pick up ' + input);
    }
}

module.exports.create = function(socket, context, connection) {
  if (context.length === 0) {
    socket.write("Create what??\n");
  }
  else {
    console.log('create input:' + input + ':');
    switch (context) {
        case 'room':
          console.log('create room triggered\n');
          socket.playerSession.expectedInput = 'name';
          rooms.createRoom(socket, connection);
          break;
        default:
          console.log('Create what??\n');
    }
  }
}
