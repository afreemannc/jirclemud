module.exports.name = 'Mobile';
module.exports.fields = {
    mid: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING
    },

    short_name: {
      type: Sequelize.STRING
    },

    description: {
      type: Sequelize.TEXT
    },

    stats: {
      type: Sequelize.TEXT
    },

    effects: {
      type: Sequelize.TEXT
    },

    equipment: {
      type: Sequelize.TEXT
    },

    inventory: {
      type: Sequelize.TEXT
    },

    extra: {
      type: Sequelize.TEXT
    }
};
