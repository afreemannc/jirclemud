var fs = require("fs");
var path = require("path");
var net = require('net');
var eventEmitter = require('events');
Events = new eventEmitter();
Config = require('./config/config.js');
Variables = require('./core/variables');
Prompt = require('./core/prompt');
Rules = require('./core/rules');
Admin = require('./core/admin');
Sequelize = require('sequelize');


var dbSettings = {
  dialect: Config.dbDialect,
}
if (typeof Config.dbUnixSocket !== 'undefined') {
  dbSettings['dialectOptions'] = {
    socketPath: Config.dbUnixSocket
  }
}

sequelize = new Sequelize(
  Config.dbName,
  Config.dbUser,
  Config.dbPass,
  dbSettings
);

Tics = require('./core/tics');
Tics.addQueue('world', Config.worldTicInterval);

Session = require('./core/session');
Commands = require('./core/commands');
Characters = require('./core/characters');
Rooms = require('./core/rooms');
Items = require('./core/items');
Zones = require('./core/zones');
Tokens = require('./core/tokens');
Mobiles = require('./core/mobiles');
Modules = require('./core/modules');

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

Variables.loadVariables();

// Initialize service and set listening port
var server = net.createServer(newSocket);
server.listen(Config.port);

// Load zones into memory
Zones.loadZones();
Rooms.loadRooms();

// Load optional modules
Modules.loadEnabledModules();

// TODO: move to session object, rely on this.socket as socket is passed during session creation.
function parseData(session, data) {
  console.log('data:' + data);
  console.log('context:' + session.inputContext);
  switch (session.inputContext) {
    case 'prompt':
      console.log(session.prompt);
      // certain prompts require collection of multi-line inputs so raw data is provided here.
      session.prompt.inputHandler(data.toString());
      break;
    case 'command':
      Commands.inputHandler(session, data.toString());
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
  var associations = {};
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
      var config = false;
      if (typeof model.config !== 'undefined') {
        config = model.config;
      }
      Models[model.name] = sequelize.define(model.name, model.fields, config);
      if (typeof model.associations !== 'undefined') {
         associations[model.name] = model.associations;
      }
    });
  // Assign associations after models are loaded
  associationKeys = Object.keys(associations);
  for (var i = 0; i < associationKeys.length; ++i) {
    var name = associationKeys[i];
    console.log('establishing association:' + name);
    var association = associations[name];
    console.log(association);
    if (typeof association.belongsTo !== 'undefined') {
      Models[name].belongsTo(Models[association.belongsTo], association.config);
    }
    if (typeof association.hasMany !== 'undefined') {
      console.log('has many assoc implemented');
      Models[name].hasMany(Models[association.hasMany], association.config);
    }
  }
}
