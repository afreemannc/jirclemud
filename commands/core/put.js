var Command = function() {
  this.trigger = 'put';
  this.helpText = '';
  this.callback = function(socket, input) {
    // Route command based on input format
    if (input.contains(' in ')) {
      this.hasIn(socket, input);
    }
    else {
      this.noIn(socket, input);
    }
  }

  // expected command format: put <item name> in <container name>
  this.hasIn = function(socket, input) {
    var commandParts = input.split(' in ');
    // One or more arguments missing
    if (commandParts.length < 2) {
      socket.playerSession.error('Put what where?');
      return;
    }
    else {
      var itemName = commandParts[0];
      var itemIndex = this.findItemInInventory(socket, itemName);
      // item doesn't exist
      if (itemIndex === false) {
        socket.playerSession.error("You don't have a " + itemName);
        return;
      }

      var containerName = commandParts[1];
      var containerDetails = this.findContainer(socket, containerName);
      if (containerDetails === false) {
        socket.playerSession.error("There is no " + containerName + " here to put things in.");
        return;
      }

      if (this.isItem(socket, containerDetails) === false) {
        socket.playerSession.error("That is not a container.");
        return;
      }

      // Looks like we're out of potential error states, let's transfer this thing already.
      var fieldValues = {
        transferType: 'character-to-container',
        item: socket.playerSession.character.inventory[itemIndex],
        index: itemIndex,
        containerIndex: containerDetails.index,
        containerLocation: containerDetails.location
      }
      global.items.transferItemInstance(socket, fieldValues);

      // It is disconcerting when commands don't provide some kind of feedback when executed, so:
      var roomId = socket.playerSession.character.currentRoom;
      var name = socket.playerSession.character.name;
      // player message
      socket.playerSession.write('You put a ' + fieldValues.item.name + ' in the ' + inventory[containerIndex].name);
      // room message
      global.rooms.message(socket, roomId, name + ' puts a ' + fieldValues.item.name + ' in a ' + inventory[containerIndex].name, true);

    }
  }

  // expected command format: put <item name> <container name>
  this.noIn = function(socket, input) {
    // TODO: come up with an approach that handles multi-word item and container names. (Ex: put black ring large sack)
    commandParts = input.split(' ');
  }

  // check personal inventory for item
  this.findItem = function(socket, itemName) {
    return global.items.searchInventory(itemName, 'name', socket.playerSession.character.inventory, true);
  }

  this.findContainer = function(socket, containerName) {
    var roomId = socket.playerSession.character.currentRoom;
    var containerIndex = this.findItem(socket, containerName);
    var inventoryType = 'character';
    // If a matching container wasn't found in personal inventory check the current room.
    if (containerIndex === false) {
      containerIndex = global.items.searchInventory(containerName, 'name', global.rooms.room[roomId].inventory, true);
      inventoryType = 'room';
    }
    if (containerIndex !== false) {
      return {index:containerIndex, location:inventoryType}
    }
    else {
      return false;
    }
  }

  this.isContainer = function(socket, containerDetails) {
    switch (containerDetails.location) {
      case 'room':
        inventory = global.rooms.room[socket.playerSession.character.currentRoom].inventory;
        break;
      case 'character':
        inventory = socket.playerSession.character.inventory;
        break;
      default:
        return false;
    }
    // TODO: update this when item types are deprecated by flags.
    if (inventory[containerDetails.index].type === 'container') {
      return true;
    }
    else {
      return false;
    }
  }
}

module.exports = new Command();
