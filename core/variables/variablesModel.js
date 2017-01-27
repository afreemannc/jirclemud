module.exports.name = 'Variable';
module.exports.fields = {
  name: {
    type: Sequelize.STRING,
    primaryKey: true
  },

  value: {
    type: Sequelize.TEXT
  }
};

module.exports.config = {
  timestamps: false
};
