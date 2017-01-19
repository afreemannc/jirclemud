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
   console.log('dir:' + dir);
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
    Module.findAll({attributes: ['name', 'status'], where:{status: 1}}).then(function(instances) {
      instances.forEach(function(instance) {
        var name = instance.get('name');
        var status = instance.get('status');
        Modules.availableModules[name].status = status;
      });
    });
  }
}

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

modules.prototype.moduleAdmin = function(session) {
  Modules.findAllModules(Modules.moduleDir);
  Modules.addModuleStatus();
  moduleAdminPrompt = Prompt.new(session, Modules.saveModuleChanges);

  adminStartField = moduleAdminPrompt.newField('select');
  adminStartField.name = 'start';
  adminStartField.options = {l:'list', e:'enable', d:'disable', q:'quit'};
  adminStartField.formatPrompt('Module administration options:');
  moduleAdminPrompt.addField(adminStartField);

  adminEnableField = moduleAdminPrompt.newField('select');
  adminEnableField.name = 'enable';
  adminEnableField.options = Modules.listModuleOptions('disabled');
  adminEnableField.formatPrompt('Select a module to enable:');
  adminEnableField.conditional = {
    field: 'start',
    value: 'enable'
  }
  moduleAdminPrompt.addField(adminEnableField);

  adminDisableField = moduleAdminPrompt.newField('select');
  adminDisableField.name = 'disable';
  adminDisableField.options = Modules.listModuleOptions('enabled');
  adminDisableField.formatPrompt('Select a module to disable:');
  adminDisableField.conditional = {
    field: 'start',
    value: 'disable'
  }
  moduleAdminPrompt.addField(adminDisableField);

  // List option is handled by a separate screen.
  console.log('module admin invoked');
  moduleAdminPrompt.start();
}

modules.prototype.saveModuleChanges = function(session, fieldValues) {
  var Module = Models.Module;
  console.log('field values:');
  console.log(fieldValues);
  // enable
  if (fieldValues.start === 'enable') {
    var allModules = this.listAllModules();
    var selectedModule = allModules[fieldValues.enable];
    var values = {
      name: selectedModule.name,
      description: selectedModule.description,
      status: 1,
      filepath: selectedModule.filepath,
      version: selectedModule.version,
      features: selectedModule.features
    }
    Module.findOrCreate(values).then(function(instance, created) {
      if (created === false) {
        Module.update({status:1}, {where:{mid:fieldValues.enable}});
      }
    });
    return true;
  }

  // disable
  if (fieldValues.start === 'disable') {
    Module.update({status:0}, {where:{mid:fieldValues.disable}}).then(function() {
      session.write('Module disabled.');
    });
    return true;
  }

  // list
  if (fieldValues.start === 'list') {
    // display module list.
    var output = '';
    var moduleKeys = Object.keys(Modules.availableModules);
    for (i = 0; i < moduleKeys.length; ++i) {
      var module = Modules.availableModules[moduleKeys[i]];
      output += module.name + ' : ' + module.status + ' : ' + module.description + '\n';
    }
    session.write(output);
    return true;
  }

  // quit
  if (fieldValues.start === 'quit') {
    // back out to arch main screen.
    return true;
  }
}

modules.prototype.listModuleOptions = function(status) {
  return {h:'hi'};
}

module.exports = new modules();
