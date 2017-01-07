
var room = function(){
  this.room = {};
};

// TODO: this method should be attached to the actual room object.
room.prototype.message = function(session, roomId, message, skipCharacter) {
  for (var i = 0; i < Sessions.length; ++i) {
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
  Room.findAll().then(function(instances)) {
    instances.forEach(function(instance) {
      Rooms.room[instance.get('rid')] = instance.dataValues;
    });
  }
}

// TODO: this should be deprecated by room.message
room.prototype.exitMessage = function(session, input) {
  var roomId = session.character.current_room;
  var name = session.character.name;
  Rooms.message(session, roomId, name + " leaves heading " + input, true);
}

room.prototype.loadExits = function(roomId) {
  var sql = 'SELECT * FROM ?? WHERE ?? = ?';
  var inserts = ['room_exits', 'rid', roomId];
  global.dbPool.query(sql, inserts, function(err, results, fields) {
    Rooms.room[roomId].exits = {};
    for (var i = 0; i < results.length; ++i) {
      Rooms.room[roomId].exits[results[i].label] = results[i];
    }
  });
}

room.prototype.createRoom = function(session) {

  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var createRoomPrompt = Prompt.new(session, this.saveRoomChanges);

  var zoneIdField = createRoomPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
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
  flagsField.name = 'flags';
  flagsField.options = {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'};
  flagsField.formatPrompt(message);
  createRoomPrompt.addField(flagsField);

  createRoomPrompt.start();
}

room.prototype.editRoomName = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editNamePrompt = Prompt.new(session, this.saveRoomChanges);

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
  descField.name = 'full_description';
  descField.value = current_room.full_description;
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

  var editDescPrompt = Prompt.new(session, this.saveRoomChanges);

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

  var currently = 'Currently:\n' + Tokens.replace(session, '%cyan' + current_room.full_description + '%cyan');
  var fullDescField = editDescPrompt.newField('multitext');
  fullDescField.name = 'full_description';
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

  var editFlagsPrompt = Prompt.new(session, this.saveRoomChanges);

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
  descField.name = 'full_description';
  descField.value = current_room.full_description;
  editFlagsPrompt.addField(descField);

  var currently = 'Currently:\n' + Tokens.replace(session, '%cyan' + current_room.flags.join(', ') + '%cyan%');
  var flagsField = editFlagsPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', s:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DEATHTRAP', m:'!MAGIC'};
  flagsField.formatPrompt(currently + message, true);
  flagsField.value = Rooms.room[roomId].flags;
  editFlagsPrompt.addField(flagsField);

  editFlagsPrompt.start();
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

room.prototype.saveExit = function(session, fieldValues) {
  return new Promise((resolve, reject) => {
    var properties = fieldValues.properties;
    var values = {
      rid: fieldValues.rid,
      target_rid:fieldValues.target_rid,
      label:fieldValues.label,
      description: fieldValues.description,
      properties: JSON.stringify(properties) // TODO: implement exit properties?
    }
    global.dbPool.query('INSERT INTO room_exits SET ?', values, function (error, results) {
      if (error) {
        return reject(error);
      }
      session.write('Exit saved.');
      session.inputContext = 'command';
      values.eid = results.insertId;
      values.properties = JSON.parse(values.properties);
      // update exit in memory;
      Rooms.room[values.rid].exits[values.label] = values;
      return resolve(values);
    });
  });
}

room.prototype.saveRoomChanges = function(session, fieldValues) {
  this.saveRoom(session, fieldValues).then((response) => {
    if (typeof fieldValues.rid !== 'undefined') {
      session.write('Room changes saved');
      return response;
    }
    else {
      session.write('New room created');
      return response;
    }
  }).catch(function (error) {
    console.log('something has gone terribly wrong:' + error);
  });
}

room.prototype.saveRoom = function(session, values) {
  return new Promise((resolve, reject) => {
    values.flags = JSON.stringify(values.flags);
    // If rid is passed in with field values this indicates changes to an existing room
    // are being saved.
    if (typeof values.rid !== 'undefined') {
      global.dbPool.query('UPDATE rooms SET ? WHERE RID = ' + values.rid, values, function (error, results) {
        // Update copy loaded in memory
        if (error) {
          return reject(error);
        }
        else {
          Rooms.room[values.rid].name = values.name;
          Rooms.room[values.rid].full_description = values.full_description;
          return resolve(values);
        }
      });
    }
    else {
      // If rid is not provided this should be saved as a new room.
      global.dbPool.query('INSERT INTO rooms SET ?', values, function (error, results) {
        if (error) {
          return reject(error);
        }
        else {
          values.rid = results.insertId;
          Rooms.room[results.insertId] = values;
          Rooms.room[results.insertId].inventory = [];
          Rooms.room[results.insertId].exits = [];
          // A container entry for the new room needs to be created so the room can
          // hold items.
          var containerValues = {
            container_type: 'room',
            parent_id: results.insertId,
            max_size: -1,
            max_weight: -1
          }
          Containers.createContainer(values);
          return resolve(values);
        }
      });
    }
  });
}

module.exports = new room();
