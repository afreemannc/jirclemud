
module.exports.loadRoom = function(rid, connection) {

}

module.exports.createRoom = function(socket, input, connection) {
  socket.playerSession.inputContext = 'command:create:room';
  var field = socket.playerSession.expectedInput;
  if (typeof socket.playerSession.newRoom === 'undefined') {
    socket.playerSession.newRoom = {};
  }
  socket.playerSession.newRoom[field] = input;

  if (socket.playerSession.expectedInput === 'name') {
    socket.playerSession.prompt('Short Description:\n');
    socket.playerSession.expectedInput = 'short_description';
    return;
  }

  if (socket.playerSession.expectedInput === 'short_description') {
    socket.playerSession.prompt('Full Description:\n');
    socket.expectedInput = 'full_description';
    return;
  }

  if (socket.playerSession.expectedInput === 'full_description') {
    saveRoom(socket, connection);
  }
}

module.exports.editRoom = function(connection) {

}

module.exports.deleteRoom = function(connection) {

}

function saveRoom(socket, connection) {
  values = socket.playerSession.newRoom;

  connect.query('INSERT INTO rooms SET ?', values, function (error, result) {});
  socket.write('Room saved.');
  socket.playerSession.inputContext = 'command';
}
