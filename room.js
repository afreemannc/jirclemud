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

room.prototype.saveRoom = function(socket, fieldValues) {
  console.log(fieldValues);
  values = {
    name:fieldValues.name,
    short_description:fieldValues.short_description,
    full_description:fieldValues.full_description
  }
  socket.connection.query('INSERT INTO rooms SET ?', values, function (error, result) {
    socket.write('Room saved.');
    socket.playerSession.inputContext = 'command';
  });
}

module.exports = new room();
