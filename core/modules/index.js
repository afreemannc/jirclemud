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
          currentModule.features = JSON.parse(currentModule.features);
          Modules.modules[currentModule.name] = require(currentModule.filepath + '/index.js');
          console.log('Modules:');
          console.log(Modules);
          if (currentModule.features.includes('commands')) {
            // load commands into memory
            console.log('module implements commands, loading:');
            var commandFolderPath = currentModule.filepath + '/commands';
            Commands.loadCommands(commandFolderPath);
          }
          console.log('current module:');
          console.log(currentModule);
          if (typeof  Modules.modules[currentModule.name].load !== 'undefined') {
            Modules.modules[currentModule.name].load();
          }
        });
      }
    });
    // alter flag lists if available
  }
  console.log(this);


module.exports = new modules();
