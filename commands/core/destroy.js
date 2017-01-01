var Command = function() {
  this.trigger = 'destroy';
  this.helpText = 'Immortals only: destroy a thing (room, item, etc).';
  this.callback = function(session, context) {
    // TODO: implement character perms checking
    if (context.length === 0) {
      session.error("Destroy what??\n");
    }
    else {
      switch (context) {
        case 'zone':
          // TODO:
          break;
        case 'room':
          global.rooms.deleteRoom(session);
          break;
        case 'item':
          // TODO:
          break;
        default:
          session.error('Destroy what??\n');
      }
    }
  }

}

module.exports = new Command();
