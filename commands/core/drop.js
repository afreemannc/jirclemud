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
    }
    else {
      socket.playerSession.error('Drop what??\n');
    }
  }

}

module.exports = new Command();
