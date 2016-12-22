
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

  var fullDescField = createRoomPrompt.newField('multitext');
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

room.prototype.editRoomName = function(socket) {
  var roomId = socket.playerSession.character.currentRoom;
  var editNamePrompt = prompt.new(socket, this.saveRoom);

  var ridField = editNamePrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editNamePrompt.addField(ridField);

  var currently =  'Currently:\n' + global.colors.cyan(global.rooms.room[roomId].name) + '\n\n';
  var nameField = editNamePrompt.newField('text');
  nameField.name = 'name';
  nameField.startField = true;
  nameField.formatPrompt(currently + 'Enter room name. (This is displayed at the top of the room description)');
  editNamePrompt.addField(nameField);


  var descField = editNamePrompt.newField('value');
  descField.name = 'full_description';
  descField.value = global.rooms.room[roomId].full_description;
  editNamePrompt.addField(descField);

  var flagsField = editNamePrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = global.rooms.room[roomId].flags;
  editNamePrompt.addField(flagsField);
  console.log('start name prompt');
  editNamePrompt.start();
}

room.prototype.editRoomDesc = function(socket) {
  var roomId = socket.playerSession.character.currentRoom;
  var editDescPrompt = prompt.new(socket, this.saveRoom);

  var ridField = editDescPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editDescPrompt.addField(ridField);

  var nameField = editDescPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = global.rooms.room[roomId].name;
  editDescPrompt.addField(nameField);

  var currently = 'Currently:\n' + global.colors.cyan(global.rooms.room[roomId].full_description);
  var fullDescField = editDescPrompt.newField('multitext');
  fullDescField.name = 'full_description';
  fullDescField.startField = true;
  fullDescField.formatPrompt(currently + 'Enter full room description. (This is displayed whenever a player enters the room)');
  editDescPrompt.addField(fullDescField);

  var flagsField = editDescPrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = global.rooms.room[roomId].flags;
  editDescPrompt.addField(flagsField);

  editDescPrompt.start();
}

room.prototype.editRoomFlags = function(socket) {
  var roomId = socket.playerSession.character.currentRoom;
  var editFlagsPrompt = prompt.new(socket, this.saveRoom);

  var ridField = editFlagsPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editFlagsPrompt.addField(ridField);

  var nameField = editFlagsPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = global.rooms.room[roomId].name;
  editFlagsPrompt.addField(nameField);

  var descField = editFlagsPrompt.newField('value');
  descField.name = 'full_description';
  descField.value = global.rooms.room[roomId].full_description;
  editFlagsPrompt.addField(descField);

  var currently = 'Currently:\n' + global.colors.cyan(global.rooms.room[roomId].flags.join(', '));
  var flagsField = editFlagsPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.startField = true;
  flagsField.options = {0:'none', s:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DEATHTRAP', m:'!MAGIC'};
  flagsField.formatPrompt(currently + message, true);
  flagsField.value = global.rooms.room[roomId].flags;
  editFlagsPrompt.addField(flagsField);

  editFlagsPrompt.start();
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
  var values = {
    zid:fieldValues.zid,
    name:fieldValues.name,
    full_description:fieldValues.full_description,
    flags:JSON.stringify(fieldValues.flags)
  }
  // If rid is passed in with field values this indicates changes to an existing room
  // are being saved.
  if (typeof fieldValues.rid !== 'undefined') {
    values.rid = fieldValues.rid;
    socket.connection.query('UPDATE rooms SET ? WHERE RID = ' + values.rid, values, function (error, results) {
      // Update copy loaded in memory
      global.rooms.room[values.rid].name = values.name;
      global.rooms.room[values.rid].full_description = values.full_description;
      socket.playerSession.write('Room changes saved.');
      socket.playerSession.inputContext = 'command';

      if (typeof callback === 'function') {
        callback(socket, results.insertId, callbackArgs);
      }
    });
  }
  else {
    // If rid is not provided this should be saved as a new room.
    socket.connection.query('INSERT INTO rooms SET ?', values, function (error, results) {
      global.rooms.room[results.insertId] = values;
      global.rooms.room[results.insertId].inventory = [];
      global.rooms.room[results.insertId].exits = [];
      socket.playerSession.write('New room saved.');
      socket.playerSession.inputContext = 'command';
      if (typeof callback === 'function') {
        callback(socket, results.insertId, callbackArgs);
      }
    });
  }
}

module.exports = new room();
