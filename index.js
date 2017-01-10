var fs = require("fs");
var path = require("path");
var net = require('net');
Config = require('./config/config.js');
Sequelize = require('sequelize');
sequelize = new Sequelize(
  Config.dbName,
  Config.dbUser,
  Config.dbPass,
  {
    dialectOptions: {
      socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    }
  }
);


Session = require('./core/session');
Commands = require('./core/commands');
Characters = require('./core/characters');
Rooms = require('./core/rooms');
Classes = require('./core/classes');
Items = require('./core/items');
Prompt = require('./core/prompt');
Zones = require('./core/zones');
Tokens = require('./core/tokens');
Containers = require('./core/containers');
Mobiles = require('./core/mobiles');

Models = {};
Sessions = [];

function newSocket(socket) {

  var session = Session.new();

  socket.on('data', function (data) {
    parseData(session, data);
  });

  socket.on('end', function() {
    closeSession(session);
  });

  session.socket = socket;
  Sessions.push(session);
  session.start();
}

// Load data models
loadModels('core');
console.log(Models);

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(Config.port);


// Load rooms into memory
Rooms.loadRooms();

// Load zones into memory
var Zone = Models.Zone;
Zone.findAll().then(function(instances) {
  instances.forEach(function(instance) {
    Zones.zone[instance.get('zid')] = instance.dataValues;
  });
});
// TODO: move to session object, rely on this.socket as socket is passed during session creation.
function parseData(session, data) {

  switch (session.inputContext) {
    case 'prompt':
      // certain prompts require collection of multi-line inputs so raw data is provided here.
      session.prompt.promptHandler(data.toString());
      break;
    case 'command':
      Commands.commandHandler(session, data.toString());
      break;
    default:
     // This shouldn't ever happen so what to put here?
     break;
  }
}

function closeSession(session) {
  var i = Sessions.indexOf(session);
  if (i !== -1) {
    Sessions.splice(i, 1);
  }
}

/**
 * Recursively scan for and load Sequilize data models.
 *
 * @param dir
 *  string directory name to scan.
 */
function loadModels(dir) {
  fs.readdirSync(dir)
    .filter(function(file) {
      var filepath = path.join(dir, file);
      if(fs.statSync(filepath).isDirectory()) {
        loadModels(filepath);
      }
      return (file.endsWith("Model.js"));
    })
    .forEach(function(file) {
      var model = require('./' + path.join(dir, file));
      Models[model.name] = sequelize.define(model.name, model.fields);
    });
}
