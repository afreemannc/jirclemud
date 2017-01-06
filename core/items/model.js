var Item = sequelize.define('items', {
  iid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true
  },

  name: {
    type: Sequelize.STRING
  },

  room_description: {
    type: Sequelize.STRING
  },

  full_description: {
    type: Sequelize.TEXT
  },

  properties: {
    type: Sequelize.TEXT
  }
});

var ItemInstance = sequelize.define('item_instances', {
  instanceID: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true
  },

  iid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  properties: {
    type: Sequelize.TEXT
  }
});
