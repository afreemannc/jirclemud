var Containers = function() {

  /**
   * Load inventory contents
   */
  this.loadInventory = function(fieldValues, session) {
    var inserts = [fieldValues.containerType, fieldValues.parentId];
    var sql = `
      SELECT
        ii.instance_id,
        i.name,
        i.room_description,
        i.full_description,
        i.properties
      FROM item_instance ii
      INNER JOIN items i
        ON i.iid = ii.iid
      INNER JOIN container_inventory ci
        ON ci.instance_id = ii.instance_id
      INNER JOIN containers c
        ON c.cid = ci.cid
      WHERE
        container_type = ?
        AND parent_id = ?`;

    sql = global.mysql.format(sql, inserts);

    global.dbPool.query(sql, function(error, results) {
      if (error) {
        console.log('unable to load inventory:' + inserts);
      }
      else {
        for (var i = 0; i < results.length; ++i) {
          results[i].properties = JSON.parse(results[i].properties);
        }
        switch (fieldValues.containerType) {
          case 'player_inventory':
            session.character.inventory = results;
            for (var i = 0; i < results.length; ++i) {
              Items.applyEffects(session, results[i]);
            }
            session.character.inventory = results;
            break;
          case 'room':
            Rooms.room[fieldValues.parentId].inventory = results;
            break;
          default:
            console.log('Unknown inventory type specified during load:' + inserts);
            break;
        }
      }
    });
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
