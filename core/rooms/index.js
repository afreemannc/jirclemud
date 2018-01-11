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
    var checkSession = Sessions[i];
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

room.prototype.listPlayersInRoom = function(roomId) {
  var players = [];
  for (var i = 0; i < Sessions.length; ++i) {
    if (Sessions[i].character.current_room === roomId) {
      players.push(Sessions[i].character.name);
    }
  }
  return players;
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
  var standardExits = ['n','s','e','w','u','d'];
  var currentExits = Object.keys(Rooms.room[roomId].exits);

  if (currentExits.includes(input) === true || standardExits.includes(input)) {
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
      var rid = instance.get('rid');
      console.log('rid:' + rid);
      Rooms.room[instance.get('rid')].exits[instance.get('label')] = exit;
    });
  });
}

/**
 * Create new or update existing room data.
 *
 * @param session
 *   User session object
 *
 * @param values
 *   Room object values to save.
 */
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

      session.write('New room created (rid:' + instance.get('rid') + ')');
    });
  }
}
// TODO: move to Builder module
room.prototype.deleteRoomPrompt = function(session) {
  var roomId = session.character.current_room;

  var deleteRoomPrompt = Prompt.new(session, this.deleteRoom, 'deleteRoom');

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

/**
 * Display room name property.
 */
room.prototype.displayRoomName = function(room) {
  return "\n%bold%%room.name%%bold%\n";
}

/**
 * Display room description property.
 */
room.prototype.displayRoomDescription = function(room) {
  return room.description + "\n";
}

/**
 * Render room exits for display.
 */
room.prototype.displayRoomExits = function(room) {
  var exits = room.exits;
  var exitKeys = Object.keys(exits);
  var standardExits = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'u', 'd'];
  if (exitKeys.length > 0) {
    var exitDisplay = []
    for (var i = 0; i < standardExits.length; ++i) {
      if (exitKeys.indexOf(standardExits[i]) !== -1) {
        // Skip closed doors.
        if (typeof exits[standardExits[i]].properties.flags !== 'undefined') {
          if (exits[standardExits[i]].properties.flags.includes('CLOSED')) {
            // Hide closed doors in exit list.
            continue;
          }
        }
        exitDisplay.push(standardExits[i]);
      }
    }
    return "Exits: [ %yellow%" + exitDisplay.join(' ') + "%yellow% ]\n\n";
  }
  else {
    return "Exits: [none]\n\n";
  }
}

/**
 * Display items in room.
 */
room.prototype.displayRoomInventory = function(room) {
  if (room.inventory.length > 0) {
    var display = Items.inventoryDisplay(room.inventory, true);
    return display + "\n";
  }
  else {
    return '';
  }
}

/**
 * Display mobs in room.
 */
room.prototype.displayRoomMobiles = function(room) {
  var output = '';
  if (typeof room.mobiles !== 'undefined' && room.mobiles.length > 0) {
    room.mobiles.forEach(function(mobile) {
        output += Tokens.replace(mobile.name + "\n", {mobile: mobile});
    });
  }
  return output;
}

/**
 * Display players in room.
 */
room.prototype.displayRoomPlayers = function(roomId, characterName) {
  var output = '';
  var characterNames = Rooms.listPlayersInRoom(roomId);
  console.log(characterNames);
  console.log(characterName);
  if (characterNames.length > 1) {
    output += "\n\n";
    for (var i = 0; i < characterNames.length; ++i) {
      if (characterName !== characterNames[i]) {
        // If colorized character names become a thing (saints preserve us) this will need to invoke Tokens.replace().
        //TODO: implement position and position signifiers.
        output += characterNames + " is $POSITIION_SIGNIFIER here.\n";
      }
    }
  }
  return output;
}

/**
 * Render room display and send output to user session.
 */
room.prototype.displayRoom = function(session, roomId) {
  var currentRoom = Rooms.room[roomId];
  var output = this.displayRoomName(currentRoom);
  output += this.displayRoomDescription(currentRoom);
  output += this.displayRoomExits(currentRoom);
  output += this.displayRoomInventory(currentRoom);
  output += this.displayRoomMobiles(currentRoom);
  output += this.displayRoomPlayers(roomId, session.character.name);
  session.write(Tokens.replace(output, {room:currentRoom}));
}

module.exports = new room();
