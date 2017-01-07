module.exports.name = 'ItemInstance';
module.exports.fields = {
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
};
