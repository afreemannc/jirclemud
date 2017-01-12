var Command = function() {
  this.trigger = 'create';
  this.permsRequired = 'BUILDER';
  this.helpText = 'Create a thing (room, item, etc).';
  this.callback = function(session, context) {
    // TODO: implement character perms checking
    if (context.length === 0) {
      session.error("Create what??\n");
    }
    else {
      switch (context) {
        case 'zone':
          Zones.createZone(session);
          break;
        case 'room':
          Rooms.createRoom(session);
          break;
        case 'item':
          Items.createItem(session);
          break;
        case 'mob':
          Mobiles.createMobile(session);
          break;
        default:
          session.error('Create what??\n');
      }
    }
  }
}

module.exports = new Command();
