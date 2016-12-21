var Command = function() {
  this.trigger = 'edit';
  this.helpText = 'Builder only: universal in-game editing command for world building. Great for editing rooms and items.';
  this.callback = function (socket, input) {
    commandArgs = input.split(' ');
    switch (commandArgs[0]) {
      case 'room':
        // room name (no argument passed (ex: 'edit room')
        if (commandArgs.length === 1) {
          socket.playerSession.error('What do you want to change?');
          break;
        }
        // room name (ex: 'edit room name')
        if (commandArgs[1] === 'name') {
          global.rooms.editRoomName(socket);
          break;
        }
        // long desc (ex: 'edit room desc')
        if (commandArgs[1] === 'desc') {
          global.rooms.editRoomDesc(socket);
          break;
        }
        // flags (ex: 'edit room flags')
        if (commandArgs[1] === 'flags') {
          global.rooms.editRoomFlags(socket);
          break;
        }
        // Garbled 2nd arg
        socket.playerSession.error('Edit what??');
        break;
      default:
        // Unknown 1st arg
        socket.playerSession.error('Edit what??');
    }

  }

}

module.exports = new Command();
