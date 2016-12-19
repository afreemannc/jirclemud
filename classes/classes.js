// Character class info
function Classes() {
  this.commands = {};
  // Load core classes
  if (global.config.includeCoreCharacterClasses === true) {
    var normalizedPath = require("path").join(__dirname, "core");
    var coreClasses = require("fs").readdirSync(normalizedPath)
    for(i = 0; i < coreClasses.length; ++i) {
      characterClass = require("./core/" + coreClasses[i]);
      this.classes[characterClass.name] = characterClass;
    }
  }

  // Load optional plugins
  normalizedPath = require("path").join(__dirname, "plugins");

  var pluginClasses = require("fs").readdirSync(normalizedPath);
  for(i = 0; i < pluginClasses.length; ++i) {
    characterClass = require("./plugin/" + pluginClasses[i]);
    // Intentionally skipping checks for pre-existing classes.
    // This permits individual implementations to override core class
    // behavior by declaring a custom version of the class in the
    // plugins directory.
    this.classes[characterClass.name] = characterClass;
  }

  this.listCharacterClasses = function() {
    var list = {};
    for  (i = 0; i < this.classes.length; ++i) {
     characterClass = this.classes[i];
      list[characterClass.selectOption] = characterClass.name;
    }
    return list;
  }
}


classes.prototype.selectionOptions = function() {
  var list = this.list();
  var options = [];
  for (i = 0; i < list.length; ++i) {
    className = list[i];
    currentClass = this[className];
    options.push(currentClass.selectOption);
  }
  return options;
}

classes.prototype.selectionPrompt = function() {
  var list = this.list();
  var prompt = ':: ';
  for (i = 0; i < list.length; ++i) {
    className = list[i];
    currentClass = this[className];
    prompt += currentClass.label + ' :: ';
  }
  return prompt + '\n';
}

classes.prototype.classFromSelection = function(selection) {
  var list = this.list();
  var options = [];
  for (i = 0; i < list.length; ++i) {
    className = list[i];
    currentClass = this[className];
    if (currentClass.selectOption === selection) {
      return currentClass;
    }
  }
  return false;
}

module.exports = new Classes();
