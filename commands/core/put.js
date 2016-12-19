var Command = function() {
  this.trigger = 'put';
  this.helpText = '';
  this.callback = function(socket, input) {
    var itemIndex = false;
    var containerIndex = false;
    var inventory = false;
    var containerLocation = false;
    // expected command format: put <item name> in <container name>
    // expected command format: put <item name> <container name>
    commandParts = input.split(' in ');
    if (commandParts.length < 1) {
      socket.playerSession.error('Put what where?');
      return;
    }
    // check personal inventory for item
    itemIndex = global.items.searchInventory(commandParts[0], 'name', socket.playerSession.character.inventory, true);
    console.log('put item found at index:' + itemIndex);

    if (itemIndex === 'false') {
      socket.playerSession.error('You dont have a ' + commandParts[0]);
      return;
    }
  // check personal inventory for container
    containerIndex = global.items.searchInventory(commandParts[1], 'name', socket.playerSession.character.inventory, true);
    console.log('put container found at index:' + containerIndex);
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
          index: itemIndex,
          containerIndex: containerIndex,
          containerLocation: containerLocation
        }
        global.items.transferItemInstance(socket, fieldValues);
        var roomId = socket.playerSession.character.currentRoom;
        var name = socket.playerSession.character.name;
        // player message
        socket.playerSession.write('You put a ' + fieldValues.item.name + ' in the ' + inventory[containerIndex].name);
        // room message
        global.rooms.message(socket, roomId, name + ' puts a ' + fieldValues.item.name + ' in a ' + inventory[containerIndex].name, true);
      }
      else {
        socket.playerSession.error('That is not a container.');
      }
    }
  }
}

module.exports = new Command();
