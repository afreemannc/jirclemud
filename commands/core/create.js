var Command = function() {
  this.trigger = 'create';
  this.helpText = '';
  this.callback = function (socket, input) {
    if (input.length === 0) {
      socket.playerSession.error("Create what??\n");
    }
    else {
      switch (context) {
        case 'room':
          global.rooms.createRoom(socket);
          break;
        case 'item':
          global.items.createItem(socket);
          break;
        default:
          socket.playerSession.error('Create what??\n');
      }
    }
  }
}

module.exports = new Command();
