/**
 * @file Prompt system class and related methods.
 */
function promptSystem() {
  this.Prompt = require('./prompt');
  this.registered = [];
  this.register = function(id, fields, completionCallback, quittable = true) {
    this.registered[id] = {
      fields: fields,
      completionCallback: completionCallback,
      quittable: quittable,
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

  this.start = function(id, session) {
    var cachedPrompt = this.registered[id];
    console.log(cachedPrompt);
    var newPrompt = this.Prompt.new(id, session, cachedPrompt.completionCallback);
    newPrompt.quittable = cachedPrompt.quittable;
    var fieldNames = Object.keys(cachedPrompt.fields);
    for (var i = 0; i < fieldNames.length; ++i) {
      var currentField = cachedPrompt.fields[fieldNames[i]];
      var newField = newPrompt.newField(currentField.type);
      Object.assign(newField, currentField);
      newField.formatPrompt(currentField.title);
      newPrompt.addField(newField);
    }
    console.log(newPrompt);
    newPrompt.start();
  }
}

module.exports = new promptSystem();
