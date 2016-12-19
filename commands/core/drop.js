var Command = function() {
  this.trigger = 'drop';
  this.helpText = '';
  this.callback = function(socket, input) {
    var index = global.items.searchInventory(input, 'name', socket.playerSession.character.inventory, true);
    if (index !== false) {
      var fieldValues = {
        transferType: 'character-to-room',
        item: socket.playerSession.character.inventory[index],
        index: index
      }
      global.items.transferItemInstance(socket, fieldValues);
      var roomId = socket.playerSession.character.currentRoom;
      var name = socket.playerSession.character.name;
      // player message
      socket.playerSession.write('You drop a ' + fieldValues.item.name);
      // room message
      global.rooms.message(socket, roomId, name + ' drops a ' +fieldValues.item.name, true);
    }
    else {
      socket.playerSession.error('Drop what??\n');
    }
  }

}

module.exports = new Command();
