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
}

module.exports = new Containers();
