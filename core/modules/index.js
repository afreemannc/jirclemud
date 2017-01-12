/**
 * @file: Module import system
 */

var fs = require('fs');
var path = require('path');

function Modules() {
  this.modules = {};

  this.moduleDir = .join(__dirname + '/../../', "modules");

  this.findModules = function(dir) {
    fs.readdirSync(dir)
      .filter(function(file) {
        var filepath = path.join(dir, file);
        if(fs.statSync(filepath).isDirectory()) {
          Modules.findModules(filepath);
        }
        return (file === "index.js");
      })
      .forEach(function(file) {
        console.log('require path:' + path.join(dir, file));
        var module = require('' + path.join(dir, file));
        Modules.module[module.name] = module.description;
      });
  }

  this.listModules() {

  }

  this.loadModule(moduleName) {
    // load commands if available
    // alter flag lists if available
  }
}

module.exports = new Modules();
