/**
 * @file Container class and associated methods for working with rooms.
 */

var room = function(){
  this.room = {};
};

/**
 * Display a message to all characters in a given room.
 *
 * @param session
 *   Player session of the character that initiated the message event.
 *
 * @param roomId
 *   Numeric room id (rid) of the room to message.
 *   If false message will be displayed to all characters globally.
 *
 * @param message
 *   Message to display
 *
 * @param skipCharacter
 *   Optional. If set to true the message will not be displayed to the character that
 *   triggered the message. This is useful for cases where other players should see
 *   a different message than the character that sent the message.
 */
room.prototype.message = function(session, roomId, message, skipCharacter) {
  for (var i = 0; i < Sessions.length; ++i) {
    // If roomID is false global message
    if (roomId === false) {
      if (skipCharacter === false || session === false || Sessions[i] != session) {
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
    else if (session != false && checkSession.character.id === session.character.id && skipCharacter === true) {
      return;
    }
    else {
      checkSession.write(message);
    }
  }
}

/**
 * Test if a given string correlates to an exit label in the current room.
 *
 * @param session
 *   Character session object.
 *
 * @param input
 *   Input string to test against exit labels.
 *
 * #return
 *   Returns true if input is an exit label otherwise false.
 */
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

/**
 * Load rooms into memory.
 */
room.prototype.loadRooms = function() {
  var Room = Models.Room;
  Room.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var room = instance.dataValues;
      room.flags = JSON.parse(room.flags);
      room.inventory = JSON.parse(room.inventory);
      room.exits = {};
      room.mobiles = [];
      Rooms.room[room.rid] = room;
    });
    Rooms.loadExits();
    Mobiles.loadMobiles();
  });
}

/**
 * Add exit data to rooms loaded in memory.
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

    var inventoryField = createRoomPrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = [];
  createRoomPrompt.addField(inventoryValue);

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

  var currently =  'Currently:\n' + Tokens.replace('%cyan%%room.name%%cyan%', {room:current_room}) + '\n\n';
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

  var inventoryField = editNamePrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = current_room.inventory;
  editNamePrompt.addField(inventoryValue);

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

  var currently = 'Currently:\n' + Tokens.replace('%cyan%%room.description%%cyan%', {room:current_room});
  var fullDescField = editDescPrompt.newField('multitext');
  fullDescField.name = 'description';
  fullDescField.formatPrompt(currently + 'Enter full room description. (This is displayed whenever a player enters the room)');
  editDescPrompt.addField(fullDescField);

  var flagsField = editDescPrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = current_room.flags;
  editDescPrompt.addField(flagsField);

  var inventoryField = editDescPrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = current_room.inventory;
  editDescPrompt.addField(inventoryValue);

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

  var currently = 'Currently:\n' + Tokens.replace('%cyan' + current_room.flags.join(', ') + '%cyan%');
  var flagsField = editFlagsPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'};
  flagsField.formatPrompt(currently + message, true);
  flagsField.value = Rooms.room[roomId].flags;
  editFlagsPrompt.addField(flagsField);

  var inventoryField = editFlagsPrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = current_room.inventory;
  editFlagsPrompt.addField(inventoryValue);

  editFlagsPrompt.start();
}

room.prototype.saveRoom = function(session, values) {
  values.flags = JSON.stringify(values.flags);
  values.inventory = JSON.stringify(values.inventory);
  var Room = Models.Room;
  if (typeof values.rid !== 'undefined' && values.rid) {
    Room.update(values, {where: {rid:values.rid}}).then(function(response) {
      values.flags = JSON.parse(values.flags);
      values.inventory = JSON.parse(values.inventory);
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
      // TODO: perhaps moving this to the validation callback would be less weird.
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

room.prototype.exitLabelToLong = function(label) {
  var labels = {
    n: 'North',
    ne: 'Northeast',
    e: 'East',
    se: 'Southeast',
    s: 'South',
    sw: 'Southwest',
    w: 'West',
    nw: 'Northwest',
  }
  if (typeof labels[label] !== 'undefined') {
    return labels[label].toString();
  }
  return false;
}

room.prototype.hasExits = function(room) {
    exitKeys = Object.keys(room.exits);
    if (exitKeys.length === 0) {
      return false;
    }
    else {
      for (i = 0; i < exitKeys.length; ++i) {
        var exit = room.exits[exitKeys[i]];
        if (exit.properties.flags.includes('CLOSED') === false) {
          return true;
        }
      }
      return false;
    }
  }

room.prototype.displayRoom = function(session, roomId) {
  var current_room = Rooms.room[roomId];
  var output = '';
  // display room title
  if (session.character.stats.flags.includes('BUILDER')) {
    output += "\n%bold%%room.name%%bold% %green%[%room.rid%]%green%\n";
  }
  else {
    output += "%bold%%room.name%%bold%\n";
  }
  // display room description
  output += "%room.description%\n";
  // display exits
  var exits = Rooms.room[roomId].exits;
  var exitKeys = Object.keys(exits);
  var standardExits = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'u', 'd'];
  if (exitKeys.length > 0) {
    var exitDisplay = []
    for (i = 0; i < standardExits.length; ++i) {
      if (exitKeys.indexOf(standardExits[i]) !== -1) {
        // Skip closed doors.
        if (typeof exits[standardExits[i]].properties.flags !== 'undefined') {
          if (exits[standardExits[i]].properties.flags.includes('CLOSED')) {
            continue;
          }
        }
        exitDisplay.push(standardExits[i]);
      }
    }
    output += "Exits: [ %yellow%" + exitDisplay.join(' ') + "%yellow% ]\n\n";
  }
  else {
    output += "Exits: [none]\n\n";
  }
  // display room inventory
  if (current_room.inventory.length > 0) {
    var display = Items.inventoryDisplay(curent_room.inventory, true);
    output += display + "\n";
  }
  // display mobiles
  if (current_room.mobiles.length > 0) {
    current_room.mobiles.forEach(function(mobile) {
      if (session.character.stats.flags.includes('BUILDER')) {
        output += Tokens.replace('%mobile.name%%yellow%[%mobile.miid%]%yellow%\n', {mobile:mobile});
      }
      else {
        output += Tokens.replace(mobile.name + "\n", {mobile: mobile});
      }
    });
  }
  session.write(Tokens.replace(output, {room:current_room}));
}

module.exports = new room();
