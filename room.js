var prompt = require('./prompt');

var room = function(){};

room.prototype.message = function(socket, roomId, message, skipCharacter) {
  console.log('room message roomId:' + roomId);
  console.log('room message message:' + message);

  for (i = 0; i < global.sockets.length; ++i) {
    playerSession = global.sockets[i].playerSession;
    // They ain't here.
    if (playerSession.room.rid !== roomId) {
      return;
    }
    if (playerSession.character.id === socket.playerSession.character.id && skipCharacter === true) {
      return;
    }
    else {
      playerSession.write(message);
    }
  }
}

room.prototype.inputIsExit = function(socket, inputRaw) {
  console.log('is exit input:' + inputRaw);
  var input = inputRaw.toString().replace(/(\r\n|\n|\r)/gm,"");
  var currentExits = socket.playerSession.room.exits;
  var roomId = socket.playerSession.room.id;
  var characterId = socket.playerSession.character.id;
  var name = socket.playerSession.character.name;
  for (i = 0; i < currentExits.length; ++i) {
    currentExit = currentExits[i];
    if (currentExit.label === input) {
      console.log('input Is Exit input:' + input);
      global.rooms.loadRoom(socket, currentExit.target_rid, input);
      return true;
    }
  }
  return false;
}

//TODO: extend this so it can be used for edit form instead of just
// the login/change room workflow.
room.prototype.loadRoom = function(socket, roomId, input) {
  console.log('loadroom input:' + input);
  var sql = "SELECT * FROM ?? WHERE ?? = ?";
  var inserts = ['rooms', 'rid', roomId];
  sql = global.mysql.format(sql, inserts);
  socket.connection.query(sql, function(err, results, fields) {
    socket.playerSession.room = results[0];
    if (input !== false) {
      global.rooms.exitMessage(socket, input);
    }
    // TODO: find where this is used and refactor it out of existence.
    socket.playerSession.character.current_room = roomId;
    var values = {
      containerType: 'room_inventory',
      parentId: roomId
    }
    global.rooms.loadExits(socket, roomId, global.items.loadInventory, values);
  });
}

room.prototype.exitMessage = function(socket, input) {
  var currentRoomId = socket.playerSession.character.current_room;
  var name = socket.playerSession.character.name;
  global.rooms.message(socket, currentRoomId, name + " leaves heading " + input, true);
}

room.prototype.loadExits = function(socket, roomId, callback, callbackArgs) {
  console.log('loading exits for room:' + roomId);
  var sql = 'SELECT * FROM ?? WHERE ?? = ?';
  var inserts = ['room_exits', 'rid', roomId];
  socket.connection.query(sql, inserts, function(err, results, fields) {
    socket.playerSession.room.exits = results;
    if (typeof callback === 'function') {
      callback(socket, callbackArgs, global.commands.look, socket);
    }
  });
}

room.prototype.createRoom = function(socket) {
  var createRoomPrompt = prompt.new(socket, this.saveRoom);

  var nameField = createRoomPrompt.newField();
  nameField.name = 'name';
  nameField.type = 'text';
  nameField.startField = true;
  nameField.inputCacheName = 'name';
  nameField.promptMessage = 'Enter room name. (This is displayed at the top of the room description)\n';
  createRoomPrompt.addField(nameField);

  var shortDescField = createRoomPrompt.newField();
  shortDescField.name = 'short_description';
  shortDescField.type = 'text';
  shortDescField.inputCacheName = 'short_description';
  shortDescField.promptMessage = 'Enter short description of room. (I have no idea where this will get displayed yet)\n';
  createRoomPrompt.addField(shortDescField);

  var fullDescField = createRoomPrompt.newField();
  fullDescField.name = 'full_description';
  fullDescField.type = 'multi';
  fullDescField.inputCacheName = 'full_description';
  fullDescField.promptMessage = 'Enter full room description. (This is displayed whenever a player enters the room)\n';
  createRoomPrompt.addField(fullDescField);

  createRoomPrompt.setActivePrompt(createRoomPrompt);
}

room.prototype.editRoom = function(connection) {

}

room.prototype.deleteRoom = function(connection) {

}

room.prototype.createPlaceholderExit = function(socket, target_rid, label) {
  console.log('made it to placeholder exit creation');
  console.log('target_rid:' + target_rid);
  console.log('label:' + label);
  console.log('session:');
  console.log(socket.playerSession);
  fieldValues = {
    rid: socket.playerSession.room.rid,
    target_rid: target_rid,
    label: label,
    description: 'Nothing to see here.',
    properties: [],
  }
  console.log(fieldValues);
  args = {target_rid:target_rid, label:label};
  global.rooms.saveExit(socket, fieldValues, global.rooms.createReciprocalExit, args);
}

room.prototype.createReciprocalExit = function(socket, args) {
  console.log('made it to reciprocal');
  label = args.label;
  rid = args.target_rid;

  fieldValues = {
    rid: rid,
    target_rid: socket.playerSession.room.rid,
    label: global.rooms.invertExitLabel(label),
    description: 'Nothing to see here.',
    properties: [],
  }
  console.log(fieldValues);
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
  console.log('made it to exit save');
  console.log(fieldValues);

  properties = fieldValues.properties;
  values = {
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
        console.log('no callback args');
        callback(socket, results.insertId);
      }
      else {
        console.log('callback args');
        callback(socket, callbackArgs);
      }
    }
  });
}

room.prototype.saveRoom = function(socket, fieldValues, callback, callbackArgs) {
  console.log(fieldValues);
  values = {
    name:fieldValues.name,
    short_description:fieldValues.short_description,
    full_description:fieldValues.full_description
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
