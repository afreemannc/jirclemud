var prompt = require('./prompt');

var room = function(){};

room.prototype.inputIsExit = function(socket, inputRaw) {
  console.log('is exit input:' + inputRaw);
  var input = inputRaw.toString().replace(/(\r\n|\n|\r)/gm,"");
  var currentExits = socket.playerSession.room.exits;
  for (i = 0; i < currentExits.length; ++i) {
    console.log(currentExits[i]);
    if (currentExits[i].label === input) {
      console.log('we move!');
      global.rooms.loadRoom(socket, currentExits[i].target_rid);
    }
  }
}

//TODO: extend this so it can be used for edit form instead of just
// the login/change room workflow.
room.prototype.loadRoom = function(socket, roomId) {
  var sql = "SELECT * FROM ?? WHERE ?? = ?";
  var inserts = ['rooms', 'rid', roomId];
  sql = global.mysql.format(sql, inserts);
  socket.connection.query(sql, function(err, results, fields) {
    socket.playerSession.room = results[0];
    global.rooms.loadExits(socket, roomId);
  });
}

room.prototype.loadExits = function(socket, roomId) {
  console.log('loading exits for room:' + roomId);
  var sql = 'SELECT * FROM ?? WHERE ?? = ?';
  var inserts = ['room_exits', 'rid', roomId];
  socket.connection.query(sql, inserts, function(err, results, fields) {
    console.log('results:');
    console.log(results);
    socket.playerSession.room.exits = results;
    console.log('room:');
    console.log(socket.playerSession.room);
    global.commands.look(socket);
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
    lable: label,
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
    lable: global.rooms.invertExitLabel(label),
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
     outpuy = 'f';
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
