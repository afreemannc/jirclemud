var Command = function() {
  this.trigger = 'put';
  this.helpText = '';
  this.callback = function(session, input) {
    // Route command based on input format
    if (input.contains(' in ')) {
      this.hasIn(session, input);
    }
    else {
      this.noIn(session, input);
    }
  }

  // expected command format: put <item name> in <container name>
  this.hasIn = function(session, input) {
    var commandParts = input.split(' in ');
    // One or more arguments missing
    if (commandParts.length < 2) {
      session.error('Put what where?');
      return;
    }
    else {
      var itemName = commandParts[0];
      var itemIndex = this.findItemInInventory(session, itemName);
      // item doesn't exist
      if (itemIndex === false) {
        session.error("You don't have a " + itemName);
        return;
      }

      var containerName = commandParts[1];
      var containerDetails = this.findContainer(session, containerName);
      if (containerDetails === false) {
        session.error("There is no " + containerName + " here to put things in.");
        return;
      }

      if (this.isItem(session, containerDetails) === false) {
        session.error("That is not a container.");
        return;
      }

      // Looks like we're out of potential error states, let's transfer this thing already.
      var fieldValues = {
        transferType: 'character-to-container',
        item: session.character.inventory[itemIndex],
        index: itemIndex,
        containerIndex: containerDetails.index,
        containerLocation: containerDetails.location
      }
      global.items.transferItemInstance(session, fieldValues);

      // It is disconcerting when commands don't provide some kind of feedback when executed, so:
      var roomId = session.character.currentRoom;
      var name = session.character.name;
      // player message
      session.write('You put a ' + fieldValues.item.name + ' in the ' + inventory[containerIndex].name);
      // room message
      global.rooms.message(session, roomId, name + ' puts a ' + fieldValues.item.name + ' in a ' + inventory[containerIndex].name, true);

    }
  }

  // expected command format: put <item name> <container name>
  this.noIn = function(socket, input) {
    // TODO: come up with an approach that handles multi-word item and container names. (Ex: put black ring large sack)
    commandParts = input.split(' ');
  }

  // check personal inventory for item
  this.findItem = function(socket, itemName) {
    return global.items.searchInventory(itemName, 'name', session.character.inventory, true);
  }

  this.findContainer = function(session, containerName) {
    var roomId = session.character.currentRoom;
    var containerIndex = this.findItem(session, containerName);
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

  this.isContainer = function(session, containerDetails) {
    switch (containerDetails.location) {
      case 'room':
        inventory = global.rooms.room[session.character.currentRoom].inventory;
        break;
      case 'character':
        inventory = session.character.inventory;
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
