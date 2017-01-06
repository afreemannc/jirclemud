module.exports.name = 'item_instances';
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
