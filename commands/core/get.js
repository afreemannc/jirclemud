var Command = function() {
  this.trigger = 'get';
  this.helpText = '';
  this.callback = function(socket, input) {
    var roomId = socket.playerSession.character.currentRoom;
    var index = global.items.searchInventory(input, 'name', global.rooms.room[roomId].inventory, true);
    if (index !== false) {
      var fieldValues = {
        transferType: 'room-to-character',
        item: global.rooms.room[roomId].inventory[index],
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
