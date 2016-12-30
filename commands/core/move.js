var Command = function() {
  this.trigger = 'move';
  this.helpText = '';
  this.callback = function (socket, input) {
    var roomId = socket.playerSession.character.currentRoom;
    var characterId = socket.playerSession.character.id;
    var currentExits = global.rooms.room[roomId].exits;

    if (typeof currentExits[input] === 'undefined') {
      socket.playerSession.error('Alas, you cannot go that way.');
    }
    else {
      var currentExit = currentExits[input];
      socket.playerSession.character.currentRoom = currentExit.target_rid;
      global.commands.triggers.look(socket, '');
    }
  }
}

module.exports = new Command();
