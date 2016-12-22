var Command = function() {
  this.trigger = 'destroy';
  this.helpText = 'Immortals only: destroy a thing (room, item, etc).';
  this.callback = function(socket, context) {
    // TODO: implement character perms checking
    if (context.length === 0) {
      socket.playerSession.error("Destroy what??\n");
    }
    else {
      switch (context) {
        case 'zone':
          // TODO:
          break;
        case 'room':
          global.rooms.deleteRoom(socket);
          break;
        case 'item':
          // TODO:
          break;
        default:
          socket.playerSession.error('Destroy what??\n');
      }
    }
  }

}

module.exports = new Command();
