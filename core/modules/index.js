/**
 * @file: Module import system
 */

var fs = require('fs');
var path = require('path');

var modules = function() {
  this.modules = {};
  this.aThing = {};
}

modules.prototype.moduleDir = path.join(__dirname + '/../../', "modules");


modules.prototype.loadEnabledModules = function() {
    var Module = Models.Module;

    Module.findAll({where:{status: 1}}).then(function(instances) {
      if (instances) {
        instances.forEach(function(instance) {
          var currentModule = instance.dataValues;
          console.log(currentModule);
          currentModule.features = JSON.parse(currentModule.features);
          console.log(currentModule);
          Modules.modules[currentModule.name] = require(currentModule.filepath + '/index.js');

          if (currentModule.features.includes('commands')) {
            // load commands into memory
            console.log('module implements commands, loading:');
            var commandFolderPath = currentModule.filepath + '/commands';
            Commands.loadCommands(commandFolderPath);
          }
        });
      }
    });
    // alter flag lists if available
  }
  console.log(this);


module.exports = new modules();
