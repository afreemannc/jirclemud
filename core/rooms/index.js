
var room = function(){
  this.room = {};
};

// TODO: this method should be attached to the actual room object.
room.prototype.message = function(session, roomId, message, skipCharacter) {
  console.log('message room id:' + roomId);
  for (var i = 0; i < Sessions.length; ++i) {
    // If roomID is false global message
    if (roomId === false) {
      if (skipCharacter === false || Sessions[i] != session) {
        session.write(message);
      }
      continue;
    }
    // Otherwise only message players in the specified room.
    checkSession = Sessions[i];
    // They ain't here.
    if (checkSession.character.current_room !== roomId) {
      return;
    }
    else if (checkSession.character.id === session.character.id && skipCharacter === true) {
      return;
    }
    else {
      session.write(message);
    }
  }
}

room.prototype.inputIsExit = function(session, input) {
  var roomId = session.character.current_room;
  var currentExits = Object.keys(Rooms.room[roomId].exits);

  if (currentExits.includes(input) === true) {
    return true;
  }
  else {
    return false;
  }
}

// Load all rooms into memory
room.prototype.loadRooms = function() {
  var Room = Models.Room;
  Room.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var room = instance.dataValues;
      room.inventory = Containers.loadInventory({inventoryType:'room', parentId: room.id});
      room.exits = {};
      room.mobiles = [];
      Rooms.room[room.rid] = room;
    });
    Rooms.loadExits();
  });
}

// TODO: this should be deprecated by room.message
room.prototype.exitMessage = function(session, input) {
  var roomId = session.character.current_room;
  var name = session.character.name;
  Rooms.message(session, roomId, name + " leaves heading " + input, true);
}

/**
 * Add exit data to room loaded in memory.
 *
 * @param rid
 *   Numeric room id.
 *
 */
room.prototype.loadExits = function() {
  var RoomExit = Models.RoomExit;
  RoomExit.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var exit = instance.dataValues;
      exit.properties = JSON.parse(exit.properties);
      Rooms.room[instance.get('rid')].exits[instance.get('label')] = exit;
    });
  });
}

room.prototype.createRoom = function(session) {

  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var createRoomPrompt = Prompt.new(session, this.saveRoom);

  var zoneIdField = createRoomPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  createRoomPrompt.addField(zoneIdField);

  var nameField = createRoomPrompt.newField('text');
  nameField.name = 'name';
  nameField.formatPrompt('Enter room name. (This is displayed at the top of the room description)');
  createRoomPrompt.addField(nameField);

  var fullDescField = createRoomPrompt.newField('multitext');
  fullDescField.name = 'description';
  fullDescField.formatPrompt('Enter full room description. (This is displayed whenever a player enters the room)');
  createRoomPrompt.addField(fullDescField);


  var flagsField = createRoomPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'};
  flagsField.formatPrompt(message);
  createRoomPrompt.addField(flagsField);

  createRoomPrompt.start();
}

room.prototype.editRoomName = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editNamePrompt = Prompt.new(session, this.saveRoom);

  var ridField = editNamePrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editNamePrompt.addField(ridField);

  var zoneIdField = editNamePrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  editNamePrompt.addField(zoneIdField);

  var currently =  'Currently:\n' + Tokens.replace(session, '%cyan%' + current_room.name + '%cyan%') + '\n\n';
  var nameField = editNamePrompt.newField('text');
  nameField.name = 'name';
  nameField.formatPrompt(currently + 'Enter room name. (This is displayed at the top of the room description)');
  editNamePrompt.addField(nameField);


  var descField = editNamePrompt.newField('value');
  descField.name = 'description';
  descField.value = current_room.description;
  editNamePrompt.addField(descField);

  var flagsField = editNamePrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = current_room.flags;
  editNamePrompt.addField(flagsField);
  console.log('start name prompt');
  editNamePrompt.start();
}

room.prototype.editRoomDesc = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editDescPrompt = Prompt.new(session, this.saveRoom);

  var ridField = editDescPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editDescPrompt.addField(ridField);

  var zoneIdField = editDescPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  editDescPrompt.addField(zoneIdField);

  var nameField = editDescPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = current_room.name;
  editDescPrompt.addField(nameField);

  var currently = 'Currently:\n' + Tokens.replace(session, '%cyan' + current_room.description + '%cyan');
  var fullDescField = editDescPrompt.newField('multitext');
  fullDescField.name = 'description';
  fullDescField.formatPrompt(currently + 'Enter full room description. (This is displayed whenever a player enters the room)');
  editDescPrompt.addField(fullDescField);

  var flagsField = editDescPrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = current_room.flags;
  editDescPrompt.addField(flagsField);

  editDescPrompt.start();
}

room.prototype.editRoomFlags = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editFlagsPrompt = Prompt.new(session, this.saveRoom);

  var ridField = editFlagsPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editFlagsPrompt.addField(ridField);

  var zoneIdField = editFlagsPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  editFlagsPrompt.addField(zoneIdField);

  var nameField = editFlagsPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = current_room.name;
  editFlagsPrompt.addField(nameField);

  var descField = editFlagsPrompt.newField('value');
  descField.name = 'description';
  descField.value = current_room.description;
  editFlagsPrompt.addField(descField);

  var currently = 'Currently:\n' + Tokens.replace(session, '%cyan' + current_room.flags.join(', ') + '%cyan%');
  var flagsField = editFlagsPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'};
  flagsField.formatPrompt(currently + message, true);
  flagsField.value = Rooms.room[roomId].flags;
  editFlagsPrompt.addField(flagsField);

  editFlagsPrompt.start();
}

room.prototype.saveRoom = function(session, values) {
  values.flags = JSON.stringify(values.flags);
  var Room = Models.Room;
  if (typeof values.rid !== 'undefined' && values.rid) {
    Room.update(values, {where: {rid:values.rid}}).then(function(response) {
      values.flags = JSON.parse(values.flags);
      var keys = Object.keys(values);
      // Update room in memory.
      for (i = 0; i < keys.length; ++i) {
        Rooms.room[values.rid][keys[i]] = values[keys[i]];
      }
      session.inputContext = 'command';
      session.write('Room changes saved.');
      Commands.triggers.look(session, '');
    });
  }
  else {
    Room.create(values).then(function(instance) {
      var newRoom = instance.dataValues;
      newRoom.exits = {};
      newRoom.inventory = [];
      newRoom.flags = JSON.parse(newRoom.flags);
      Rooms.room[newRoom.rid] = newRoom;

      var Container = Models.Container;
      var containerValues = {
        container_type: 'room',
        parent_id: newRoom.rid,
        max_size: -1,
        max_weight: -1,
      }
      // This can happen asyncronously so no need for .then().
      Container.create(containerValues);
      session.inputContext = 'command';
      session.write('New room created (rid:' + instance.get('rid') + ')');
    });
  }
}

room.prototype.deleteRoomPrompt = function(session) {
  var roomId = session.character.current_room;

  var deleteRoomPrompt = Prompt.new(session, this.deleteRoom);

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
      session.inputContext = 'command';
      session.write('Primal chaos recedes as you turn your thoughts away from destruction.');
      return false;
    }
  };
  deleteRoomPrompt.addField(roomIdField);

  deleteRoomPrompt.start();
}

room.prototype.deleteRoom = function(session, fieldValues) {
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

module.exports = new room();
