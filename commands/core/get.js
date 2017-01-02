var Command = function() {
  this.trigger = 'get';
  this.helpText = 'Get an item (ex: get ye flask)';
  this.callback = function(session, input) {
    var roomId = session.character.currentRoom;
    var name = session.character.name;
    var index = global.containers.findItemInContainer(input, 'name', global.rooms.room[roomId].inventory, true);
    if (index !== false) {
      var fieldValues = {
        transferType: 'room-to-character',
        item: global.rooms.room[roomId].inventory[index],
        index: index
      }
      global.items.transferItemInstance(session, fieldValues);
      // player message
      session.write('You pick up a ' + fieldValues.item.name);
      // room message
      global.rooms.message(session, roomId, name + ' picks up a ' + fieldValues.item.name, true);
    }
    else {
      session.error('Get what??\n');
    }
  }
}

module.exports = new Command();
