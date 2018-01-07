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
          Prompt.start('create_zone', session);
          break;
        case 'room':
          Prompt.start('create_room', session);
          break;
        case 'item':
          Prompt.start('create_item', session);
          break;
        case 'mob':
          Prompt.start('create_mobile', session);
          break;
        default:
          session.error('Create what??\n');
      }
    }
  }
}

module.exports = new Command();
