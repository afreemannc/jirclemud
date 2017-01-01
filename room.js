
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
  var currentExits = Object.keys(global.rooms.room[roomId].exits);

  if (currentExits.includes(input) === true) {
    return true;
  }
  else {
    return false;
  }
}

// Load all zones into memory
room.prototype.loadRooms = function() {
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
      global.items.loadInventory({}, values);
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
    global.rooms.room[roomId].exits = {};
    for (i = 0; i < results.length; ++i) {
      global.rooms.room[roomId].exits[results[i].label] = results[i];
    }
    // TODO ditch this pattern in favor of promises if needed
    if (typeof callback === 'function') {
      callback(socket, callbackArgs, global.commands.triggers.look, socket);
    }
  });
}

room.prototype.createRoom = function(socket) {

  var roomId = socket.playerSession.character.currentRoom;
  var currentRoom = global.rooms.room[roomId];

  var createRoomPrompt = prompt.new(socket, this.saveRoomChanges);

  var zoneIdField = createRoomPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = currentRoom.zid;
  createRoomPrompt.addField(zoneIdField);

  var nameField = createRoomPrompt.newField('text');
  nameField.name = 'name';
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
  var currentRoom = global.rooms.room[roomId];

  var editNamePrompt = prompt.new(socket, this.saveRoomChanges);

  var ridField = editNamePrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editNamePrompt.addField(ridField);

  var zoneIdField = editNamePrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = currentRoom.zid;
  editNamePrompt.addField(zoneIdField);

  var currently =  'Currently:\n' + global.colors.cyan(currentRoom.name) + '\n\n';
  var nameField = editNamePrompt.newField('text');
  nameField.name = 'name';
  nameField.formatPrompt(currently + 'Enter room name. (This is displayed at the top of the room description)');
  editNamePrompt.addField(nameField);


  var descField = editNamePrompt.newField('value');
  descField.name = 'full_description';
  descField.value = currentRoom.full_description;
  editNamePrompt.addField(descField);

  var flagsField = editNamePrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = currentRoom.flags;
  editNamePrompt.addField(flagsField);
  console.log('start name prompt');
  editNamePrompt.start();
}

room.prototype.editRoomDesc = function(socket) {
  var roomId = socket.playerSession.character.currentRoom;
  var currentRoom = global.rooms.room[roomId];

  var editDescPrompt = prompt.new(socket, this.saveRoomChanges);

  var ridField = editDescPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editDescPrompt.addField(ridField);

  var zoneIdField = editDescPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = currentRoom.zid;
  editDescPrompt.addField(zoneIdField);

  var nameField = editDescPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = currentRoom.name;
  editDescPrompt.addField(nameField);

  var currently = 'Currently:\n' + global.colors.cyan(currentRoom.full_description);
  var fullDescField = editDescPrompt.newField('multitext');
  fullDescField.name = 'full_description';
  fullDescField.formatPrompt(currently + 'Enter full room description. (This is displayed whenever a player enters the room)');
  editDescPrompt.addField(fullDescField);

  var flagsField = editDescPrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = currentRoom.flags;
  editDescPrompt.addField(flagsField);

  editDescPrompt.start();
}

room.prototype.editRoomFlags = function(socket) {
  var roomId = socket.playerSession.character.currentRoom;
  var currentRoom = global.rooms.room[roomId];

  var editFlagsPrompt = prompt.new(socket, this.saveRoomChanges);

  var ridField = editFlagsPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editFlagsPrompt.addField(ridField);

  var zoneIdField = editFlagsPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = currentRoom.zid;
  editFlagsPrompt.addField(zoneIdField);

  var nameField = editFlagsPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = currentRoom.name;
  editFlagsPrompt.addField(nameField);

  var descField = editFlagsPrompt.newField('value');
  descField.name = 'full_description';
  descField.value = currentRoom.full_description;
  editFlagsPrompt.addField(descField);

  var currently = 'Currently:\n' + global.colors.cyan(currentRoom.flags.join(', '));
  var flagsField = editFlagsPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', s:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DEATHTRAP', m:'!MAGIC'};
  flagsField.formatPrompt(currently + message, true);
  flagsField.value = global.rooms.room[roomId].flags;
  editFlagsPrompt.addField(flagsField);

  editFlagsPrompt.start();
}

room.prototype.deleteRoomPrompt = function(socket) {
  var roomId = socket.playerSession.character.currentRoom;

  var deleteRoomPrompt = prompt.new(socket, this.deleteRoom);

  var roomIdField = deleteRoomPrompt.newField('value');
  roomIdField.name = 'rid';
  roomIdField.value = roomId;
  deleteRoomPrompt.addField(roomIdField);

  var confirmField = deleteRoomPrompt.newField('select');
  confirmField.name = 'confirm';
  confirmField.options = {d:'Delete', c:'Cancel'};
  confirmField.formatPrompt('If you proceed this room and its contents will be unrecoverably destroyed. Are you certain you want to do this?');
  confirmField.cacheInput = function(input) {
    if (input === 'd') {
      return true;
    }
    else {
      // This is unusual for a cache function. Since there is a cancel option we want to gracefully bail out of
      // prompt mode without triggering the prompt completion callback.
      socket.playerSession.inputContext = 'command';
      socket.playerSession.write('Primal chaos recedes as you turn your thoughts away from destruction.');
      return false;
    }
  };
  deleteRoomPrompt.addField(roomIdField);

  deleteRoomPrompt.start();
}

room.prototype.deleteRoom = function(socket, fieldValues) {
  // unload room from memory if present
  // delete db record for room
  // delete all room exits
  // delete any room exits targeting this room
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
    case 'ne':
      output = 'sw';
      break;
    case 'nw':
      output = 'se';
      break;
    case 's':
      output = 'n';
      break;
    case 'se':
      output = 'nw';
      break;
    case 'sw':
      output = 'ne';
      break;
    case 'u':
      output = 'd';
      break;
    case 'd':
      output = 'u';
      break;
    default:
      // Get the weird stuff like "portal" or "gate"
      output = label;
      break;
  }
  return output;
}

room.prototype.saveExit = function(socket, fieldValues) {
  return new Promise((resolve, reject) => {
    var properties = fieldValues.properties;
    var values = {
      rid: fieldValues.rid,
      target_rid:fieldValues.target_rid,
      label:fieldValues.label,
      description: fieldValues.description,
      properties: JSON.stringify(properties) // TODO: implement exit properties?
    }
    socket.connection.query('INSERT INTO room_exits SET ?', values, function (error, results) {
      if (error) {
        return reject(error);
      }
      socket.playerSession.write('Exit saved.');
      socket.playerSession.inputContext = 'command';
      values.eid = results.insertId;
      values.properties = JSON.parse(values.properties);
      // update exit in memory;
      global.rooms.room[values.rid].exits[values.label] = values;
      return resolve(values);
    });
  });
}

room.prototype.saveRoomChanges = function(socket, fieldValues) {
  this.saveRoom(socket, fieldValues).then((response) => {
    console.log('response:');
    console.log(response);
    if (typeof fieldValues.rid !== 'undefined') {
      socket.write('Room changes saved');
      return response;
    }
    else {
      socket.write('New room created');
      return response;
    }
  }).catch(function (error) {
    console.log('something has gone terribly wrong:' + error);
  });
}

room.prototype.saveRoom = function(socket, values) {
  return new Promise((resolve, reject) => {
    values.flags = JSON.stringify(values.flags);
    // If rid is passed in with field values this indicates changes to an existing room
    // are being saved.
    if (typeof values.rid !== 'undefined') {
      socket.connection.query('UPDATE rooms SET ? WHERE RID = ' + values.rid, values, function (error, results) {
        // Update copy loaded in memory
        if (error) {
          return reject(error);
        }
        else {
          global.rooms.room[values.rid].name = values.name;
          global.rooms.room[values.rid].full_description = values.full_description;
          return resolve(values);
        }
      });
    }
    else {
      // If rid is not provided this should be saved as a new room.
      socket.connection.query('INSERT INTO rooms SET ?', values, function (error, results) {
        if (error) {
          return reject(error);
        }
        else {
          values.rid = results.insertId;
          global.rooms.room[results.insertId] = values;
          global.rooms.room[results.insertId].inventory = [];
          global.rooms.room[results.insertId].exits = [];
          // A container entry for the new room needs to be created so the room can
          // hold items.
          var containerValues = {
            container_type: 'room',
            parent_id: results.insertId,
            max_size: -1,
            max_weight: -1
          }
          global.containers.createContainer(values);
          return resolve(values);
        }
      });
    }
  });
}

module.exports = new room();
