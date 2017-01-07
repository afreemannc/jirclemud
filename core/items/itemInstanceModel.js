module.exports.name = 'ItemInstance';
module.exports.fields = {
  instanceID: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  iid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  properties: {
    type: Sequelize.TEXT
  }
};
