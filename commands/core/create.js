var Command = function() {
  this.trigger = 'create';
  this.helpText = 'Immortals only: create a thing (room, item, etc).';
  this.callback = function(socket, context) {
    // TODO: implement character perms checking
    if (context.length === 0) {
      socket.playerSession.error("Create what??\n");
    }
    else {
      switch (context) {
        case 'zone':
          global.zones.createZone(socket);
          break;
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
