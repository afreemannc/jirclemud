var Command = function() {
  this.trigger = 'move';
  this.helpText = '';
  this.callback = function (socket, input) {
    var roomId = socket.playerSession.character.currentRoom;
    var characterId = socket.playerSession.character.id;
    var currentExits = global.rooms.room[roomId].exits;

    for (i = 0; i < currentExits.length; ++i) {
      currentExit = currentExits[i];
      if (currentExit.label === input) {
        global.rooms.loadRoom(socket, currentExit.target_rid, input);
      }
    }

  }
}

module.exports = new Command();
