module.exports.name = 'Zone';
module.exports.fields = {
  zid: {
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

  rating: {
    type: Sequelize.INTEGER.UNSIGNED
  },

  tic_interval: {
    type: Sequelize.INTEGER.UNSIGNED
  }
};
