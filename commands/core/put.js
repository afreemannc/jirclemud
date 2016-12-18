var Command = function() {
  this.trigger = 'put';
  this.helpText = '';
  this.callback = function(socket, input) {
    var itemIndex = false;
    var containerIndex = false;
    var inventory = false;
    var containerLocation = false;
    // expected command format: get <item name> from <container name>
    commandParts = input.split('from');
    if (commandParts.length < 2) {
      socket.playerSession.error('Put what where?');
      return;
    }
    // check personal inventory for item
    itemIndex = global.items.searchInventory(commandParts[0], 'name', socket.playerSession.character.inventory, true);

    if (itemIndex === 'false') {
      socket.playerSession.error('You dont have ' + commandParts[0]);
      return;
    }
  // check personal inventory for container
    containerIndex = global.items.searchInventory(commandParts[0], 'name', socket.playerSession.character.inventory, true);

    if (containerIndex !== false) {
      inventory = socket.playerSession.character.inventory;
      containerLocation = 'character inventory';
    }
    // TODO: add check on character EQ slots (scabbards, worn bags, etc)
    else {
      // no? ok how about the room?
      roomId = socket.playerSession.character.currentRoom;
      containerIndex = global.items.searchInventory(commandParts[0], 'name', global.rooms.room[roomId].inventory, true);

      if (containerIndex !== false) {
        inventory = global.rooms.room[roomId].inventory;
        containerLocation = 'room';
      }
    }
    if (inventory !== false) {
      if (inventory[containerIndex].type === 'container') {
        var fieldValues = {
          transferType: 'character-to-container',
          item: inventory[itemIndex],
          index: index,
          containerIndex: containerIndex,
          containerLocation: containerLocation
        }
        global.items.transferItemInstance(socket, fieldValues);
      }
      else {
        socket.playerSession.error('That is not a container.');
      }
    }
  }
}

module.exports = new Command();
