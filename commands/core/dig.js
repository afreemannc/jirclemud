var Command = function() {
  this.trigger = 'quit';
  this.helpText = '';
  this.callback = function (socket, input) {
    if (input.length === 0) {
      socket.playerSession.error('Dig where??\n');
    }
    else {
      fieldValues = {
        name: 'Empty space',
        short_description: 'Nothing to see here.',
        full_description: 'Empty space just waiting to be filled. Remind you of Prom night?'
      }
      global.rooms.saveRoom(socket, fieldValues, global.rooms.createPlaceholderExit, direction);
    }
  }

}

module.exports = new Command();
