module.exports.name = 'ContainerInventory';
module.exports.fields = {
  ciid: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  cid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  instance_id: {
    type: Sequelize.INTEGER.UNSIGNED,
  },
}
