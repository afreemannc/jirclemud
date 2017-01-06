module.exports.name = 'character';
module.exports.fields = {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING
    },

    pass: {
      type: Sequelize.STRING
    },

    salt: {
      type: Sequelize.STRING(8),
    },

    last_login: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    logged_in: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    status: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    current_room: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    stats: {
      type: Sequelize.TEXT
    },

    effects: {
      type: Sequelize.TEXT
    }
};
