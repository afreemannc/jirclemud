var rooms = require('./room');
var colors = require('colors/safe');

module.exports.commandHandler = function(socket, inputRaw, connection) {
  var commandSegments = inputRaw.split(' ');
  var command = commandSegments[0];
  console.log('command:' + command + ':');
  commandSegments.splice(0, 1);
  var arg = commandSegments.join(' ');
  console.log(typeof commandSegments);
  console.log('length:' + commandSegments.length);
  console.log(commandSegments);
  // If input matches an exit label for the current room treat as move.
  if (global.rooms.inputIsExit(socket, inputRaw) === true) {
    return;
  }

  if (typeof this[command]  === 'function') {
    this[command](socket, arg);
  }
  else {
     socket.write('wut\n');
  }
}

module.exports.quit = function(socket, input) {
   socket.end('Goodbye!\n');
}

module.exports.say = function(socket, input) {
  roomId = socket.playerSession.room.rid;
  name = socket.playerSession.character.name;
  characterID = socket.playerSession.character.id;
  var playerMessage = "You say:" + input + "\n";
  var roomMessage = name + " says:" + input + "\n";
  global.rooms.message(socket, roomId, roomMessage, true);
  socket.playerSession.write(playerMessage);
  /*
  for (i = 0; i < global.sockets.length; ++i) {
    if (global.sockets[i].playerSession.room.id === roomId) {
      if (global.sockets[i].playerSession.character.id === characterID) {
        message = "You say:";
      }
      else {
        message = name + " says:";
      }
      output = message + input + "\n";
      global.sockets[i].playerSession.write(global.color.magenta(output));
    }
  }*/
}

module.exports.look = function(socket) {
    // Room look
    console.log('look invoked');
    socket.write(global.colors.bold(socket.playerSession.room.name) + "\n\n");
    socket.write(socket.playerSession.room.full_description + "\n");
    var exits = [];
    for (i = 0; i < socket.playerSession.room.exits.length; ++i) {
      exit = socket.playerSession.room.exits[i];
      exits.push(global.colors.yellow(exit.label));
    }
    socket.playerSession.write('Exits: [ ' + exits.join(' ') + ' ]\n');
  // TODO: implement item look
}

module.exports.get = function(socket, input) {
    if (input.length === 0) {
      socket.playerSession.error('Get what??\n');
    }
    else {
    // does thing exist?
    // can it be gotten?
       // CARRY flag?
       // Weight vs character lift?
       // Room in carry inventory?
    // if so transfer item from current location to carry inventory
    socket.playerSession.write('You pick up ' + input);
    }
}

module.exports.teleport = function(socket, input) {
  // TODO: confirm current user has GOD or DEMI flag
  if (input.length === 0) {
    socket.playerSession.error("Teleport where??\n");
  }
  else {
    // validate room name/number

      // update user room #
      // fire "look"
    // error on bs location
  }
}


module.exports.create = function(socket, context) {
  console.log('context:');
  console.log(context);
  if (context.length === 0) {
    socket.write("Create what??\n");
  }
  else {
    switch (context) {
        case 'room':
          global.rooms.createRoom(socket);
          break;
        case 'item':
          global.items.createItem(socket);
          break;
        default:
          socket.playerSession.error('Create what??\n');
    }
  }
}

module.exports.dig = function(socket, direction) {
  if (direction.length === 0) {
    socket.playerSession.error('Dig where??\n');
  }
  else {
    fieldValues = {
      name: 'Empty space',
      short_description: 'Nothing to see here.',
      full_description: 'Empty space just waiting to be filled. Remind you of Prom night?'
    }
    console.log('dig triggered, invoking new room creation');
    global.rooms.saveRoom(socket, fieldValues, global.rooms.createPlaceholderExit, direction);
  }
}

module.exports.inv = function(socket) {
  console.log('charactr in inv');
  console.log(socket.playerSession.character);
  var display = global.items.inventoryDisplay(socket, socket.playerSession.character.inventory);
  var output = 'You are carrying:\n' + display + '\n';
  socket.playerSession.write(output);
}
