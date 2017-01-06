var Container = sequelize.define('containers', {
  cid: {
    type: Sequelize.INTEGER.UNSIGNED,
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
});

var ContainerInstance = sequelize.define('container_instance', {
  ciid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true
  },

  cid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  instance_id: {
    type: Sequelize.INTEGER.UNSIGNED,
  },
});
