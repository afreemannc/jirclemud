module.exports.name = 'zones';
module.exports.fields = {
  zid: {
    type: Sequelize.INTEGER.UNSIGNED
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
  }

};
