module.exports.name = 'items';
module.exports.fields = {
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
};
