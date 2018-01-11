var fs = require('fs');
var path = require('path');
var prompt = require('prompt');
var crypto = require('crypto');
Sequelize = require('sequelize');
var Config = require('./config/config.js');

var dbSettings = {
  dialect: Config.dbDialect,
  logging: false
}
if (typeof Config.dbUnixSocket !== 'undefined') {
  dbSettings['dialectOptions'] = {
    socketPath: Config.dbUnixSocket,
  }
}

sequelize = new Sequelize(
  Config.dbName,
  Config.dbUser,
  Config.dbPass,
  dbSettings
);

Models = {};
loadModels('core');
promptForAdminAcct();
sequelize.sync().then(function() {
  createZone();
  createRoom();
  setVariables();
}).catch(function(error) {
  console.log('Unable to complete the installation due to database errors:');
  console.log(error);
  console.log('Please check the database credentials in config.js and try again.');
});

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

function createZone() {
  var values = {
    zid: 1,
    name: 'The Void',
    description: '',
    rating: 10,
    tic_interval: 3600
  }
  Models.Zone.create(values);
}

function createRoom() {
  var values = {
    zid: 1,
    name: 'Primal Chaos',
    description: 'A small pocket of reality amidst the swirling void.',
    flags: JSON.stringify([]),
    inventory: JSON.stringify([])
  }
  Models.Room.create(values);
}

function setVariables() {
  var values = {
    name: 'startRoomId',
    value: 1
  }
  Models.Variable.create(values).then(function(response) {
    console.log('Start Room ID set');
  });
}

function promptForAdminAcct() {
  console.log('Admin account details:'
  prompt.get(['name', 'password'], function(err, result) {
    console.log('character name:' + result.name);
    console.log('password:' + result.password);
    var salt = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
    var hash = crypto.createHmac('sha512', salt);
    hash.update(result.password);
    var passHash = hash.digest('hex');

   var values = {
     name: result.name,
     pass: passHash,
     salt: salt,
     last_login: 0,
     logged_in: 0,
     status: 1,
     perms: JSON.stringify(['ADMIN']),
     current_room: 1,
     stats: JSON.stringify([]),
     effects: JSON.stringify([]),
     equipment: JSON.stringify([]),
     inventory: JSON.stringify([]),
   }
   Models.Character.create(values).then(function() {
     console.log('Admin account created.');
   });
  });
}

