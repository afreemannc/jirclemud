var rooms = require('./room');
var colors = require('colors/safe');

module.exports.commandHandler = function(socket, inputRaw, connection) {
  var commandSegments = inputRaw.split(' ');
  var command = commandSegments[0];
  console.log('command:' + command + ':');
  commandSegments.splice(0, 1);
  console.log(typeof commandSegments);
  console.log('length:' + commandSegments.length);
  console.log(commandSegments);
  socket.write('Command received:' + inputRaw);
  if (typeof this[command]  === 'function') {
    this[command](socket, commandSegments);
  }
  else {
     socket.write('wut\n');
  }
}

module.exports.quit = function(socket) {
   socket.end('Goodbye!\n');
}

module.exports.look = function(socket) {
    // Room look
    socket.write(socket.playerSession.room.full_description);
  // TODO: implement item look
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

module.exports.teleport = function(socket, input) {
  // TODO: confirm current user has GOD or DEMI flag
  if (input.length === 0) {
    socket.write(colors.red("Teleport where??\n"));
  }
  else {
    // validate room name/number

      // update user room #
      // fire "look"
    // error on bs location
  }
}



module.exports.create = function(socket, context) {
  if (context.length === 0) {
    socket.write("Create what??\n");
  }
  else {
    switch (context[0]) {
        case 'room':
          console.log('create room triggered\n');
          rooms.createRoom(socket);
          break;
        default:
          console.log('Create what??\n');
    }
  }
}
