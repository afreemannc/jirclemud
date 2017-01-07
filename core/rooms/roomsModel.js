module.exports.name = 'Room';
module.exports.fields = {
  rid: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
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
