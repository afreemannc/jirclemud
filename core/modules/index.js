/**
 * @file: Module import system
 */

var fs = require('fs');
var path = require('path');

var modules = function() {
  this.modules = {};
  this.availableModules = {};
  this.moduleDir = path.join(__dirname + '/../../', "modules");

  Admin.tasks['m'] = {
    name: 'Manage Modules',
    callback: this.moduleAdmin
  }

  // load module details
  /**
   * List all modules in a folder.
   *
   * @param dir
   *   Directory to scan. If omitted defaults to the base modules directory.
   *
   * @return
   *   Returns an object containing modules keyed by name.
   */
  this.findAllModules = function(dir) {
   fs.readdirSync(dir)
      .filter(function(file) {
        var filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
          Modules.findAllModules(filepath);
        }
        return (file === "index.js");
      })
      .forEach(function(file) {
        var module = require(path.join(dir, file));
        module.status = 0;
        module.filePath = dir;
        Modules.availableModules[module.name] = module;
      });

  }

  this.addModuleStatus = function() {
    var Module = Models.Module;
    Module.findAll({attributes: ['mid', 'name', 'status']}).then(function(instances) {
      instances.forEach(function(instance) {
        var name = instance.get('name');
        var status = instance.get('status');
        var mid = instance.get('mid');
        // If this isn't explicitly converted to a string user input won't match when compared via ===
        // This breaks module selection fields that display mid as the select option.
        mid = mid.toString();
        Modules.availableModules[name].status = status;
        Modules.availableModules[name].mid = mid;
      });
    });
  }
}

/**
 * Load all modules that have been enabled.
 */
modules.prototype.loadEnabledModules = function() {
  Modules.findAllModules(Modules.moduleDir);
  Modules.addModuleStatus();

  var Module = Models.Module;

  Module.findAll({where:{status: 1}}).then(function(instances) {
    if (instances) {
      instances.forEach(function(instance) {
        var currentModule = instance.dataValues;
        currentModule.features = JSON.parse(currentModule.features);
        console.log(currentModule.features);
        Modules.modules[currentModule.name] = require(currentModule.filepath + '/index.js');
        console.log(Modules.modules[currentModule.name]);
        if (typeof currentModule.features !== 'undefined' && currentModule.features.includes('commands')) {
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

modules.prototype.moduleAdmin = function(session) {
  moduleAdminPrompt = Prompt.new(session, Modules.saveModuleChanges);

  adminStartField = moduleAdminPrompt.newField('select');
  adminStartField.name = 'start';
  adminStartField.options = {l:'list', e:'enable', d:'disable', q:'quit'};
  adminStartField.formatPrompt('Module administration options:');
  moduleAdminPrompt.addField(adminStartField);

  adminEnableField = moduleAdminPrompt.newField('select');
  adminEnableField.name = 'enable';
  adminEnableField.options = Modules.listModuleOptions(0);
  adminEnableField.formatPrompt('Select a module to enable:');
  adminEnableField.conditional = {
    field: 'start',
    value: 'enable'
  }
  moduleAdminPrompt.addField(adminEnableField);

  adminDisableField = moduleAdminPrompt.newField('select');
  adminDisableField.name = 'disable';
  adminDisableField.options = Modules.listModuleOptions(1);
  adminDisableField.formatPrompt('Select a module to disable:');
  adminDisableField.conditional = {
    field: 'start',
    value: 'disable'
  }
  moduleAdminPrompt.addField(adminDisableField);

  moduleAdminPrompt.start();
}

modules.prototype.saveModuleChanges = function(session, fieldValues) {
  if (fieldValues.start === 'enable') {
    var moduleStatus = 1;
    var name = fieldValues.enable;
  }
  else {
    var moduleStatus = 0;
    var name = fieldValues.disable;
  }

  switch (fieldValues.start) {
    case 'enable':
      var module = Modules.availableModules[name];
      if (typeof module.install !== 'undefined') {
        module.install();
      }
      if (typeof module.mid === 'undefined') {
        var Module = Models.Module;
        var values = {
          name: module.name,
          features: null,
          description: module.description,
          status: 1,
          filepath: module.filePath,
          varsion: module.version
        }
        if (Array.isArray(module.features)) {
          values.features = JSON.stringify(module.features);
        }
        Module.create(values).then(function() {
          session.write('Module status updated. This change will not take effect until the mud is restarted.');
        });
        break;
      }
      // intentionally fall through to update if there is already a record
      // for this module in the db (true if mid is set).
    case 'disable':
      var Module = Models.Module;

      Module.update({status:moduleStatus}, {where:{name:name}}).then(function() {
        session.write('Module status updated. This change will not take effect until the mud is restarted.');
        Modules.availableModules[name].status = moduleStatus;
      });
      session.inputContext = 'command';
      Modules.moduleAdmin(session);
      break;
    case 'list':
      var output = '';
      var moduleKeys = Object.keys(Modules.availableModules);
      for (i = 0; i < moduleKeys.length; ++i) {
        var module = Modules.availableModules[moduleKeys[i]];
        output += module.name + ' : ' + module.status + ' : ' + module.description + '\n';
      }
      session.write(output);
      session.inputContext = 'command';
      Modules.moduleAdmin(session);
      return true;
      break;
    case 'quit':
      session.inputContext = 'command';
      Admin.listTasks(session);
      return true;
      break;
    default:
      session.inputContext = 'command';
      return false;
  }
}

modules.prototype.listModuleOptions = function(status) {
  var moduleKeys = Object.keys(Modules.availableModules);
  var options = {};
  for (var i = 0; i < moduleKeys.length; ++i) {
    var module = Modules.availableModules[moduleKeys[i]];
    if (module.status === status) {
      options[i] = module.name;
    }
  }
  return options;
}

module.exports = new modules();
