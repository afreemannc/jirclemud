var Events = require('events');

var Containers = function() {
  this.event = new Events.EventEmitter(),
  /**
   * Load inventory contents
   */
  this.loadInventory = function(values, session) {
    return [];
  }

  /**
   * Search an inventory array for a value in a particular field.
   *
   * @param input
   *   String to search for.
   *
   * @param field
   *   Item field to search in
   *
   * @param inventory
   *   Inventory array to search
   *
   * @param like
   *   Toggle between literal search and search containing.
   *
   */
  this.findItemInContainer = function(input, field, inventory, like) {
    var foundIndex = false;
    // Standard container inventories are arrays.
    if (Array.isArray(inventory)) {
      var numericKeys = true;
      var length = inventory.length
    }
    // Player equipment inventories are objects keyed by eq slot.
    else {
      var numericKeys = false;
      var keys = Object.keys(inventory);
      var length = keys.length;
    }

    for (var i = 0; i < length; ++i) {
      if (numericKeys) {
        item = inventory[i];
      }
      else {
        item = inventory[keys[i]];
      }
      // Player equipment inventories frequently have empty slots which should be skipped.
      if (item === false) {
        continue;
      }
      // Weird things happen after a drop command has been executed but before
      if (like === true) {
        if (item[field].includes(input) === true) {
          foundIndex = i;
          break;
        }
      }
      else {
        if (item[field] === input) {
          foundIndex = i;
        }
      }
    }
    if (numericKeys) {
      return foundIndex;
    }
    else {
      return keys[foundIndex];
    }
  }

  /**
   * Transfer an item from one container to another (ex: from player inventory to room via drop, etc)
   *
   * @param session
   *   Player session object for the individual performing the transfer.
   *
   * @param transferDetails
   *   Object containing the following keys:
   *   - transferType: which type of transfer to perform.
   *   - index: array index of the item being transferred.
   *   - item: item object being transfered.
   *
   */
  this.transferItemInstance = function(session, transferDetails) {
    // Note: inventory alterations to containers, rooms, and players must be syncronous to prevent
    // race conditions and item duping.
    var item = transferDetails.item;
    Containers.event.emit('itemMove', session, item);
    switch (transferDetails.transferType) {
      // "drop" command
      case 'character-to-room':
        var roomId = session.character.current_room;
        // delete inventory[index] from character inventory
        session.character.inventory.splice(transferDetails.index, 1);
        // add item to room[room id].inventory
        Rooms.room[roomId].inventory.push(transferDetails.item);
        break;
      // "get" command
      case 'room-to-character':
        var roomId = session.character.current_room;
        // delete inventory[index] from room inventory
        Rooms.room[roomId].inventory.splice(transferDetails.index, 1);
        // add item to room[room id].inventory
        session.character.inventory.push(transferDetails.item);
        break;
      // "give" command
      case 'character-to-character':

        break;
      // ???
      case 'room-to-room':

        break;
      // "get <item> from <container>" command
      case 'container-to-character':

        break;
      // "put <item> in <container>" command
      case 'character-to-container':
       // delete session.character.inventory[transferDetails.index];
       // if (transferDetails.containerLocation === 'character inventory') {

       // }
        break;
      // wear command
      case 'character-to-equipped':
        console.log(transferDetails.item.properties);
        var equipmentSlot = transferDetails.item.properties.equipmentSlot;
        console.log('equipment slot:' + equipmentSlot);
        if (typeof session.character.equipment[equipmentSlot] !== false) {
          // transfer equipment already in this slot to inventory
          // if transfer fails due to flag effects (CURSE) halt transfer and show message.
        }
        session.character.inventory.splice(transferDetails.index, 1);
        session.character.equipment[equipmentSlot] = transferDetails.item;
        break;
      // remove command
      case 'equipped-to-character':
        var equipmentSlot = transferDetails.item.properties.equipmentSlot;
        session.character.equipment[equipmentSlot] = false;
        console.log(transferDetails);
        session.character.inventory.push(transferDetails.item);
        break;
      default:
        break;
    }
  }
}

module.exports = new Containers();
