module.exports.name = 'Character';
module.exports.fields = {
    id: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
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

    perms: {
      type: Sequelize.TEXT
    },

    current_room: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    stats: {
      type: Sequelize.TEXT
    },

    effects: {
      type: Sequelize.TEXT
    },

    equipment: {
      type: Sequelize.TEXT
    }

    inventory: {
      type: Sequelize.TEXT
    }
};
