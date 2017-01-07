module.exports.name = 'RoomExit';
module.exports.fields = {
  eid: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  rid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  target_rid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  label: {
    type: Sequelize.STRING,
  },

  description: {
    type: Sequelize.TEXT
  },

  properties: {
    type: Sequelize.TEXT
  }
};
