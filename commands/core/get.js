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
      var roomId = socket.playerSession.character.currentRoom;
      var name = socket.playerSession.character.name;
      // player message
      socket.playerSession.write('You pick up a ' + fieldValues.item.name);
      // room message
      global.rooms.message(socket, roomId, name + ' picks up a ' +fieldValues.item.name, true);
    }
    else {
      socket.playerSession.error('Get what??\n');
    }
  }
}

module.exports = new Command();
