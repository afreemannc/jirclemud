var Command = function() {
  this.trigger = 'drop';
  this.helpText = '';
  this.callback = function(session, input) {
    var index = global.containers.findItemInContainer(input, 'name', session.character.inventory, true);
    if (index !== false) {
      var transferDetails = {
        transferType: 'character-to-room',
        item: session.character.inventory[index],
        index: index
      }
      global.containers.transferItemInstance(session, transferDetails);
      var roomId = session.character.currentRoom;
      var name = session.character.name;
      // player message
      //TODO: write a thing to determine if a or an is appropriate.
      session.write('You drop a ' + fieldValues.item.name);
      // room message
      global.rooms.message(session, roomId, name + ' drops a ' +fieldValues.item.name, true);
    }
    else {
      session.error('Drop what??\n');
    }
  }

}

module.exports = new Command();
