module.exports.name = 'MobilesInstance';
module.exports.fields = {
    miid: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    mid: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    start_rid: {
      type: Sequelize.INTEGER.UNSIGNED
    },

    name: {
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
