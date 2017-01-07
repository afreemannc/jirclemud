module.exports.name = 'Container';
module.exports.fields = {
    cid: {
      type: Sequelize.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },

    container_type: {
      type: Sequelize.STRING(60),
    },

    parent_id: {
      type: Sequelize.INTEGER.UNSIGNED,
    },

    max_size: {
      type: Sequelize.INTEGER,
    },

    max_weight: {
      type: Sequelize.INTEGER,
    },
};
