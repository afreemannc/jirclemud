
var room = function(){
  this.room = {};
};

room.prototype.message = function(socket, roomId, message, skipCharacter) {
  for (i = 0; i < global.sockets.length; ++i) {
    playerSession = global.sockets[i].playerSession;
    // They ain't here.
    if (roomId !== false && playerSession.characterId.currentRoom !== roomId) {
      return;
    }
    else if (playerSession.character.id === socket.playerSession.character.id && skipCharacter === true) {
      return;
    }
    else {
      playerSession.write(message);
    }
  }
}

room.prototype.inputIsExit = function(socket, input) {
  var roomId = socket.playerSession.character.currentRoom;
  var currentExits = global.rooms.room[roomId].exits;

  for (i = 0; i < currentExits.length; ++i) {
    currentExit = currentExits[i];
    if (currentExit.label === input) {
      return true;
    }
  }
  return false;
}

// Load all zones into memory
room.prototype.loadRooms = function(connection) {
  // Only trigger room load if the target room isn't already loaded.
  var sql = "SELECT * FROM rooms";
  global.connection.query(sql, function(err, results, fields) {
    for(i = 0; i < results.length; ++i) {
      console.log('loading room ' + results[i].rid);
      var roomId = results[i].rid;
      global.rooms.room[roomId] = results[i];
      global.rooms.loadExits(roomId);
      var values = {
        containerType: 'room_inventory',
        parentId: roomId
      }
      global.items.loadInventory(values);
    }
    console.log('The world is loaded!');
  });
}

/*
//TODO: extend this so it can be used for edit form instead of just
// the login/change room workflow.
room.prototype.loadRoom = function(socket, roomId, input) {
  var sql = "SELECT * FROM ?? WHERE ?? = ?";
  var inserts = ['rooms', 'rid', roomId];
  // Only trigger room load if the target room isn't already loaded.
  if (typeof global.rooms.room[roomId] === 'undefined') {
    sql = global.mysql.format(sql, inserts);
    socket.connection.query(sql, function(err, results, fields) {
      var roomId = results[0].rid;
      socket.playerSession.character.currentRoom = roomId;
      global.rooms.room[roomId] = results[0];
      global.rooms.room[roomId].inventory = {}; // initialize with empty inventory
      if (input !== false) {
       // TODO: move this somewhere else. Having this function emit output means it cant be used as a generic loader.
        global.rooms.exitMessage(socket, input);
      }
      // TODO: find where this is used and refactor it out of existence.
      socket.playerSession.character.currentRoom = roomId;
      var values = {
        containerType: 'room_inventory',
        parentId: roomId
      }
      global.rooms.loadExits(socket, roomId, global.items.loadInventory, values);
    });
  }
  else {
    socket.playerSession.character.currentRoom = roomId;
    global.commands.triggers.look(socket, '');
  }
}
*/
// TODO: this should be deprecated by room.message
room.prototype.exitMessage = function(socket, input) {
  var currentRoomId = socket.playerSession.character.currentRoom;
  var name = socket.playerSession.character.name;
  global.rooms.message(socket, currentRoomId, name + " leaves heading " + input, true);
}

room.prototype.loadExits = function(roomId, callback, callbackArgs) {
  var sql = 'SELECT * FROM ?? WHERE ?? = ?';
  var inserts = ['room_exits', 'rid', roomId];
  global.connection.query(sql, inserts, function(err, results, fields) {
    global.rooms.room[roomId].exits = results;
    if (typeof callback === 'function') {
      callback(socket, callbackArgs, global.commands.triggers.look, socket);
    }
  });
}

room.prototype.createRoom = function(socket) {
  var createRoomPrompt = prompt.new(socket, this.saveRoom);

  var nameField = createRoomPrompt.newField('text');
  nameField.name = 'name';
  nameField.startField = true;
  nameField.formatPrompt('Enter room name. (This is displayed at the top of the room description)');
  createRoomPrompt.addField(nameField);

  var shortDescField = createRoomPrompt.newField('text');
  shortDescField.name = 'short_description';
  shortDescField.formatPrompt('Enter short description of room. (I have no idea where this will get displayed yet)');
  createRoomPrompt.addField(shortDescField);

  var fullDescField = createRoomPrompt.newField('multitext');
  console.log('full desc field:');
  console.log(fullDescField);
  fullDescField.name = 'full_description';
  fullDescField.formatPrompt('Enter full room description. (This is displayed whenever a player enters the room)');
  createRoomPrompt.addField(fullDescField);


  var flagsField = createRoomPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', s:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DEATHTRAP'};
  flagsField.formatPrompt(message, true);
  createRoomPrompt.addField(flagsField);

  createRoomPrompt.start();
}

room.prototype.editRoom = function(socket, roomId) {
  var editRoomPrompt = prompt.new(socket, this.saveRoom);

  var nameField = edidRoomPrompt.newField('text');
  nameField.name = 'name';
  nameField.startField = true;
  nameField.formatPrompt('Enter room name. (This is displayed at the top of the room description)');
  editRoomPrompt.addField(nameField);

  var shortDescField = editRoomPrompt.newField('text');
  shortDescField.name = 'short_description';
  shortDescField.formatPrompt('Enter short description of room. (I have no idea where this will get displayed yet)');
  editRoomPrompt.addField(shortDescField);

  var fullDescField = createRoomPrompt.newField('multitext');
  fullDescField.name = 'full_description';
  fullDescField.formatPrompt('Enter full room description. (This is displayed whenever a player enters the room)');
  editRoomPrompt.addField(fullDescField);

  editRoomPrompt.start();
}

room.prototype.deleteRoom = function(socket, roomId) {
  // unload room from memory if present
  // delete db record for room
  // delete all room exits
  // delete any room exits targeting this room
}

room.prototype.createPlaceholderExit = function(socket, target_rid, label) {
  fieldValues = {
    rid: socket.playerSession.character.currentRoom,
    target_rid: target_rid,
    label: label,
    description: 'Nothing to see here.',
    properties: [],
  }
  args = {target_rid:target_rid, label:label};
  global.rooms.saveExit(socket, fieldValues, global.rooms.createReciprocalExit, args);
}

room.prototype.createReciprocalExit = function(socket, args) {
  label = args.label;
  rid = args.target_rid;

  fieldValues = {
    rid: rid,
    target_rid: socket.playerSession.character.currentRoom,
    label: global.rooms.invertExitLabel(label),
    description: 'Nothing to see here.',
    properties: [],
  }
  global.rooms.saveExit(socket, fieldValues, global.user.changeRoom, rid)
}

room.prototype.invertExitLabel = function(label) {
  var output = '';
  switch (label) {
    case 'e':
     output = 'w';
     break;
    case 'w':
     output = 'e';
     break;
    case 'n':
     output = 's';
     break;
    case 's':
     output = 's';
     break;
    case 'u':
     output = 'd';
     break;
    default:
      output = label;
  }
  return output;
}

room.prototype.saveExit = function(socket, fieldValues, callback, callbackArgs) {
  var properties = fieldValues.properties;
  var values = {
    rid: fieldValues.rid,
    target_rid:fieldValues.target_rid,
    label:fieldValues.label,
    description: fieldValues.description,
    properties: JSON.stringify(properties) // TODO: implement exit properties?
  }
  socket.connection.query('INSERT INTO room_exits SET ?', values, function (error, result) {
    socket.playerSession.write('Exit saved.');
    socket.playerSession.inputContext = 'command';
    if (typeof callback === 'function') {
      if (callbackArgs === false) {
        callback(socket, results.insertId);
      }
      else {
        callback(socket, callbackArgs);
      }
    }
  });
}

room.prototype.saveRoom = function(socket, fieldValues, callback, callbackArgs) {
  console.log('field values in saveRoom:');
  console.log(fieldValues);
  var values = {
    name:fieldValues.name,
    short_description:fieldValues.short_description,
    full_description:fieldValues.full_description,
    flags:JSON.stringify(fieldValues.flags)
  }
  socket.connection.query('INSERT INTO rooms SET ?', values, function (error, results) {
    socket.playerSession.write('Room saved.');
    socket.playerSession.inputContext = 'command';
    if (typeof callback === 'function') {
      callback(socket, results.insertId, callbackArgs);
    }
  });
}

module.exports = new room();
