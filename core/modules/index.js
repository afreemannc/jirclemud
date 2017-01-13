/**
 * @file: Module import system
 */

var fs = require('fs');
var path = require('path');

var modules = function() {
  this.modules = {};
  this.availableModules = {};
}

// Path to the modules base directory.
modules.prototype.moduleDir = path.join(__dirname + '/../../', "modules");

/**
 * Load all modules that have been enabled.
 */
modules.prototype.loadEnabledModules = function() {
  var Module = Models.Module;

  Module.findAll({where:{status: 1}}).then(function(instances) {
    if (instances) {
      instances.forEach(function(instance) {
        var currentModule = instance.dataValues;
        currentModule.features = JSON.parse(currentModule.features);
        Modules.modules[currentModule.name] = require(currentModule.filepath + '/index.js');

        if (currentModule.features.includes('commands')) {
          // load commands into memory
          var commandFolderPath = currentModule.filepath + '/commands';
          Commands.loadCommands(commandFolderPath);
        }
        if (typeof  Modules.modules[currentModule.name].load !== 'undefined') {
          Modules.modules[currentModule.name].load();
        }
      });
    }
  });
}


/**
 * List all modules in a folder.
 *
 * @param dir
 *   Directory to scan. If omitted defaults to the base modules directory.
 *
 * @return
 *   Returns an object containing modules keyed by name.
 */
modules.prototype.listAllModules = function(dir) {
  if (!dir) {
    dir = Modules.moduleDir;
  }
  fs.readdirSync(dir)
    .filter(function(file) {
      var filepath = path.join(dir, file);
      if(fs.statSync(filepath).isDirectory()) {
        listAllModules(filepath);
      }
      return (file === "index.js");
    })
    .forEach(function(file) {
      var module = require(path.join(dir, file));
      module.filePath = dir;
      Modules.availableModules[module.name] = module;
    });

  return Modules.availableModules;
}

module.exports = new modules();
