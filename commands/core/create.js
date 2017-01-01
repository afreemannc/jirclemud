var Command = function() {
  this.trigger = 'create';
  this.helpText = 'Immortals only: create a thing (room, item, etc).';
  this.callback = function(session, context) {
    // TODO: implement character perms checking
    if (context.length === 0) {
      session.error("Create what??\n");
    }
    else {
      switch (context) {
        case 'zone':
          global.zones.createZone(session);
          break;
        case 'room':
          global.rooms.createRoom(session);
          break;
        case 'item':
          global.items.createItem(session);
          break;
        default:
          session.error('Create what??\n');
      }
    }
  }
}

module.exports = new Command();
