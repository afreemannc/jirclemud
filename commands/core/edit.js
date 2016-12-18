var Command = function() {
  this.trigger = 'Edit';
  this.helpText = 'Immortals only: universal in-game editing command for world building. Great for editing rooms and items.';
  this.callback = function (socket, input) {
    commandArgs = input.split(' ');
    switch (commandArgs[0]) {
      // Full room edit.
      case 'here':
        global.rooms.editRoom(socket, false);
        break;
      case 'room':
        // room name

        // short desc

        // long desc

        // flags
        break;
      default:
        socket.playerSession.error('Edit what??');
    }

  }

}

module.exports = new Command();
