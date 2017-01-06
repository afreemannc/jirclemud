module.exports.name = 'ContainerInstance';
module.exports.fields = {
  ciid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true
  },

  cid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  instance_id: {
    type: Sequelize.INTEGER.UNSIGNED,
  },
}
