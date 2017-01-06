var Rooms = sequelize.define('rooms', {
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
});


var RoomExits = sequelize.define('room_exits', {
  eid: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true
  },

  rid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  target_rid: {
    type: Sequelize.INTEGER.UNSIGNED,
  },

  label: {
    type: Sequelize.STRING,
  },

  description: {
    type: Sequelize.TEXT
  },

  properties: {
    type: Sequelize.TEXT
  }
});
