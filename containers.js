var Containers = function() {
  /**
   * Create a new container entry for the parent object (room, character, item)
   *
   * @param values
   *   Object: {
   *     container_type: <room, character_inventory, item>
   *     parent_id: <unique id of the parent object. rid for room, id for character, instance_id for container items>
   *   }
   *
   * @return Promise
   *   resolve returns the container id if insert was successful, otherwise reject returns the error encountered.
   */
  this.createContainer = function(values) {
    return new Promise((resolve, reject) => {
      global.dbPool.query('INSERT INTO containers SET ?', values, function (error, results) {
        if (error) {
          return reject(error);
        }
        else {
          return resolve(results.insertId);
        }
      });
    });
  }

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
        switch (fieldValues.containerType) {
          case 'player_inventory':
            session.character.inventory = results;
            break;
          case 'room':
            global.rooms.room[fieldValues.parentId].inventory = results;
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

    for (i = 0; i < inventory.length; ++i) {
      item = inventory[i];
      // Weird things happen after a drop command has been executed but before
      if (like === true) {
        if (item[field].includes(input)  === true) {
          return i;
        }
      }
      else {
        if (item[field] === input) {
          return i;
        }
      }
    }
    return false;
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
        var roomId = session.character.currentRoom;
        // delete inventory[index] from character inventory
        session.character.inventory.splice(transferDetails.index, 1);
        // add item to room[room id].inventory
        global.rooms.room[roomId].inventory.push(transferDetails.item);
        break;
      // "get" command
      case 'room-to-character':
        var roomId = session.character.currentRoom;
        // delete inventory[index] from room inventory
        global.rooms.room[roomId].inventory.splice(transferDetails.index, 1);
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
        delete session.character.inventory[fieldValues.index];
        if (fieldValues.containerLocation === 'character inventory') {

        }
        break;

      default:
        break;
    }
  }
}

module.exports = new Containers();
