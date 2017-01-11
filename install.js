var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var Config = reqire('./config/config.js');

var dbSettings = {
  dialect: Config.dbDialect,
}
if (typeof Config.dbUnixSocket !== 'undefined') {
  dbSettings['dialectOptions'] = {
    socketPath: Config.dbUnixSocket
  }
}
console.log(dbSettings);

sequelize = new Sequelize(
  Config.dbName,
  Config.dbUser,
  Config.dbPass,
  dbSettings
);

Models = {}
loadModels(core);

sequelize.sync().then(function() {

}).catch(function(error)) {
  console.log('Unable to complete the installation due to database errors:');
  console.log(error);
  console.log('Please check the database credentials in config.js and try again.');
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
