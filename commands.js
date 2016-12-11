
module.exports.commandHandler = function(socket, inputRaw, connection) {
  var commandSegments = inputRaw.split(' ');
  var command = commandSegments[0];
  commandSegments.splice(0, 1);
  var arg = commandSegments.join(' ');
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
  roomId = socket.playerSession.currentRoom;
  name = socket.playerSession.character.name;
  characterID = socket.playerSession.character.id;
  var playerMessage = "You say:" + input + "\n";
  var roomMessage = name + " says:" + input + "\n";
  global.rooms.message(socket, roomId, roomMessage, true);
  socket.playerSession.write(playerMessage);
}

module.exports.look = function(socket) {
    // Room look
    var roomId = socket.playerSession.character.currentRoom;
    socket.write(global.colors.bold(global.rooms.room[roomId].name) + "\n\n");
    socket.write(global.rooms.room[roomId].full_description + "\n\n");
    // display room inventory
    var display = global.items.inventoryDisplay(socket, global.rooms.room[roomId].inventory);
    socket.write(display + "\n\n");
    var exits = [];
    for (i = 0; i < global.rooms.room[roomId].exits.length; ++i) {
      exit = global.rooms.room[roomId].exits[i];
      exits.push(global.colors.yellow(exit.label));
    }
    socket.playerSession.write('Exits: [ ' + exits.join(' ') + ' ]\n');
  // TODO: implement item loo`k
}

module.exports.get = function(socket, input) {
  var roomId = socket.playerSession.character.currentRoom;
  var index = global.items.searchInventory(input, 'name', global.rooms.room[roomId].inventory, true);
  console.log('index:' + index);
  if (index !== false) {
    var fieldValues = {
      transferType: 'room-to-character',
      item: global.rooms.room[roomId].inventory[index],
      index: index
    }
    global.items.transferItemInstance(socket, fieldValues);
  }
  else {
    socket.playerSession.error('Drop what??\n');
  }
}

module.exports.drop = function(socket, input) {
  console.log('drop invoked with input:' + input);
  var index = global.items.searchInventory(input, 'name', socket.playerSession.character.inventory, true);
  console.log('index:' + index);
  if (index !== false) {
    var fieldValues = {
      transferType: 'character-to-room',
      item: socket.playerSession.character.inventory[index],
      index: index
    }
    global.items.transferItemInstance(socket, fieldValues);
  }
  else {
    socket.playerSession.error('Drop what??\n');
  }
}

module.exports.put = function(socket, input) {
  var itemIndex = false;
  var containerIndex = false;
  var inventory = false;
  var containerLocation = false;
  // expected command format: get <item name> from <container name>
  commandParts = input.split('from');
  if (commandParts.length < 2) {
    socket.playerSession.error('Put what where?');
    return;
  }



  // check personal inventory for item
  itemIndex = global.items.searchInventory(commandParts[0], 'name', socket.playerSession.character.inventory, true);

  if (itemIndex === 'false') {
    socket.playerSession.error('You dont have ' + commandParts[0]);
    return;
  }

  // check personal inventory for container
  containerIndex = global.items.searchInventory(commandParts[0], 'name', socket.playerSession.character.inventory, true);

  if (containerIndex !== false) {
      inventory = socket.playerSession.character.inventory;
      containerLocation = 'character inventory';
  }
  // TODO: add check on character EQ slots (scabbards, worn bags, etc)
  else {
    // no? ok how about the room?
    roomId = socket.playerSession.character.currentRoom;
    containerIndex = global.items.searchInventory(commandParts[0], 'name', global.rooms.room[roomId].inventory, true);

    if (containerIndex !== false) {
      inventory = global.rooms.room[roomId].inventory;
      containerLocation = 'room';
    }
  }

  if (inventory !== false) {
    if (inventory[containerIndex].type === 'container') {

      var fieldValues = {
        transferType: 'character-to-container',
        item: inventory[itemIndex],
        index: index,
        containerIndex: containerIndex,
        containerLocation: containerLocation
      }
      global.items.transferItemInstance(socket, fieldValues);
    }
    else {
      socket.playerSession.error('That is not a container.');
    }
  }
  else {
    socket.playerSession.error('Put what where?');
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
  if (context.length === 0) {
    socket.playerSession.error("Create what??\n");
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
    global.rooms.saveRoom(socket, fieldValues, global.rooms.createPlaceholderExit, direction);
  }
}

module.exports.inv = function(socket) {
  var display = global.items.inventoryDisplay(socket, socket.playerSession.character.inventory);
  var output = 'You are carrying:\n' + display + '\n';
  socket.playerSession.write(output);
}
