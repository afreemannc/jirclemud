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

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(Config.port);

//Rooms.loadRooms();
//Zones.loadZones();
// TODO: move to session object, rely on this.socket as socket is passed during session creation.
function parseData(session, data) {
  console.log('data:' + data);

  switch (session.inputContext) {
    case 'prompt':
      // certain prompts require collection of multi-line inputs so raw data is provided here.
      session.prompt.promptHandler(data);
      break;
    case 'command':
      // commands should only every be single line so data is sanitized to remove newline characters.
      Commands.commandHandler(session, data);
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
