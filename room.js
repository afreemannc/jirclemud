var prompt = require('./prompt');

var room = function(){};

room.prototype.loadRoom = function(socket, roomId, callback) {
  var sql = "SELECT * FROM ?? WHERE ?? = ?";
  var inserts = ['rooms', 'rid', roomId];
  sql = global.mysql.format(sql, inserts);
  socket.connection.query(sql, function(err, results, fields) {
    socket.playerSession.room = results[0];
    if (typeof callback === 'function') {
      callback(socket, results[0]);
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
    lable: label,
    description: 'Nothing to see here.',
    properties: [],
  }
  global.rooms.saveExit(socket, fieldValues, global.user.changeRoom, target_rid);
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
