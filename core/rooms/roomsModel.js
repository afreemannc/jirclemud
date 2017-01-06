module.exports.name = 'rooms';
module.exports.fields = {
  rid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true
  },

  zid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  name: {
    type: Sequelize.STRING,
  },

  description: {
    type: Sequelize.TEXT
  },

  flags: {
    type: Sequelize.TEXT
  }
};
