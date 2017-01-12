module.exports.name = 'Module';
module.exports.fields = {
  mid: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: Sequelize.STRING
  },

  description: {
    type: Sequelize.TEXT
  },

  status: {
    type: Sequelize.INTEGER.UNSIGNED
  },

  version: {
    type: Sequelize.STRING
  }
};
