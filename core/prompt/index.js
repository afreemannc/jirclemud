/**
 * @file Prompt system class and related methods.
 */
function promptSystem() {
  this.makePrompt = require('./prompt');
  this.registered = [];
  this.register = function(id, fields, completionCallback, quittable = true) {
    this.registered[id] = {
      fields: fields,
      completionCallback: completionCallback,
      quittable: quittable,
    }
  }

  /**
   * Register prompts defined in modules.
   */
  this.loadPrompts = function(filepath) {
    var pluginPrompts = require("fs").readdirSync(filepath);
    for (var i = 0; i < pluginPrompts.length; ++i) {
      if (pluginPrompts[i].endsWith('.js')) {
        var file = pluginCommands[i];
        var pluginPrompt = require(dir + "/" + file);
        this.register(pluginPrompt.id, pluginPrompt.fields, pluginPrompt.completionCallback, pluginPrompt.quittable);
      }
    }
  }

  this.getPrompt = function(id) {
    if (typeof this.registered[id] !== 'undefined') {
      return this.registered[id];
    }
    else {
      return false;
    }
  }
  /**
   * Initiate prompt sequence.
   *
   * @param id
   *   ID of prompt to execute.
   *
   * @param session
   *   User session to prompt.
   */
  this.start = function(id, session) {
    console.log('session in prompt:');
    console.log(session);
    var cachedPrompt = this.registered[id];
    var newPrompt = this.makePrompt.new(id, session, cachedPrompt.completionCallback, cachedPrompt.quittable);
    newPrompt.quittable = cachedPrompt.quittable;
    var fieldNames = Object.keys(cachedPrompt.fields);

    for (var i = 0; i < fieldNames.length; ++i) {
      var currentField = cachedPrompt.fields[fieldNames[i]];
      var newField = newPrompt.newField(currentField.type);
      // Newly created field inherits properties from the cached copy of the field.
      Object.assign(newField, currentField);
      newPrompt.addField(newField);
    }
    newPrompt.start();
  }

  this.startEdit = function(id, session, fieldName, values) {
    var cachedPrompt = this.registered[id];
    var newPrompt = this.Prompt.new(id, sessions, cachedPrompt.completionCallback, cachedPrompt.quittable);
    var fieldNames = Object.keys(cachedPrompt.fields);
    for (var i = 0; i < fieldNames.length; ++i) {
      // We really don't want to permanently alter the parent prompt here.
      var currentField = {...cachedPrompt.fields[fieldNames[i]]};
      // Any fields other than the edit field should be converted to value fields.
      if (fieldName !== fieldNames[i]) {
        currentField.type = 'value';
        currentField.value = values[fieldNames[i]];
        currentField.conditional = {};
      }
      var newField = newPrompt.newField(currentField.type);
      Object.assign(newField, currentField);
      var replaceInPrefix = false;
      if (typeof currentField.replaceInPrefix !== 'undefined') {
        replaceInPrefix = currentField.replaceInPrefix;
      }
      if (newField.formatPrompt !== false) {
        console.log('format prompt type:' + typeof newField.formatPrompt);
        newField.formatPrompt(currentField.title + '\n%green%Currently: ' + values[fieldName] + '%green%', replaceInPrefix);
      }
      newPrompt.addField(newField);
    }
  }
}

module.exports = new promptSystem();
