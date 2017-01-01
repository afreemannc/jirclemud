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
}

module.exports = new Containers();
