var Command = function() {
  this.trigger = 'dig';
  this.helpText = '';
  this.callback = function(socket, input) {
    if (input.length === 0) {
      socket.playerSession.error('Dig where??\n');
    }
    else {
      var roomId = socket.playerSession.character.currentRoom;
      // It would be nonsensical to permit digging in a direction with a pre-existing exit.
      for (i = 0; i < global.rooms.room[roomId].exits.length; ++i) {
        exit = global.rooms.room[roomId].exits[i];
        if (input === exit.label) {
          socket.playerSession.error('An exit already exists in that direction');
          break;
        }
      }
      fieldValues = {
        name: 'Empty space',
        short_description: 'Nothing to see here.',
        full_description: 'Empty space just waiting to be filled. Remind you of Prom night?'
      }
      global.rooms.saveRoom(socket, fieldValues, global.rooms.createPlaceholderExit, input);
    }
  }

}

module.exports = new Command();
