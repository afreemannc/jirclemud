function prompt(socket, completionCallback) {
  this.socket = socket;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;
}

/**
 * Primary input handler for prompt system
 *
 * @param input
 *   User input fresh from the socket.
 *
 * @return none
 *
 */
prompt.prototype.promptHandler = function(input) {
  var currentPrompt = this.socket.playerSession.prompt;
  if (typeof currentPrompt.currentField !== 'undefined') {
    var currentField = currentPrompt.currentField;
    // If the current field has a validation callback
    // invoke it before input is cached. This callback
    // will be responsible for returning execution to this
    // function to complete caching input if needed.
    if (currentField.validationCallback !== false) {
      currentField.validationCallback(this.socket, input);
    }
    else {
      this.cacheInput(input);
      fieldIndex = currentPrompt.getFieldIndex(currentField.name);
      if (fieldIndex < currentPrompt.fields.length - 1) {
        ++fieldIndex;
        var field = currentPrompt.fields[fieldIndex];
        this.socket.playerSession.prompt.currentField = field;
        this.socket.write(field.promptMessage);
      }
      else {
        if (currentPrompt.completionCallback !== false) {
           var fieldValues = {};
           for (i = 0; i < currentPrompt.fields.length; ++i) {
             fieldValues[currentPrompt.fields[i].name] = this.socket.playerSession.prompt.fields[i].value;
           }
           currentPrompt.completionCallback(this.socket, fieldValues);
        }
      }
    }
  }
}

prompt.prototype.setActivePrompt = function(newPrompt) {
  this.socket.playerSession.prompt = newPrompt;
  this.start();
}

prompt.prototype.cacheInput = function(inputRaw) {
    var currentField = this.socket.playerSession.prompt.currentField;
    if (currentField.type === 'text') {
      input = inputRaw.toString().replace(/(\r\n|\n|\r)/gm,"");
    }
    else {
      input = inputRaw;
    }
    index = this.getFieldIndex(currentField['name']);
    if (currentField.value === false) {
      this.socket.playerSession.prompt.fields[index].value = input;
    }
    else {
      this.socket.playerSession.prompt.fields[index].value += input;
    }
}

prompt.prototype.newField = function() {
  return new Field();
}

prompt.prototype.addField = function(field) {
    this.fields.push(field);
}

// Get index of field by name
prompt.prototype.getFieldIndex = function(name) {
  fields = this.socket.playerSession.prompt.fields;
  for (i = 0; i < fields.length; ++i) {
    if (fields[i].name === name) {
      return i;
    }
  }
  return false;
}

prompt.prototype.start = function() {
  this.socket.playerSession.inputContext = 'prompt';
  var fields = this.socket.playerSession.prompt.fields;
  for (i = 0; i < fields.length; ++i) {
    field = fields[i];
    if (typeof field.startField !== 'undefined' && field.startField === true) {
      this.socket.playerSession.prompt.currentField = field;
      switch(field.type) {
        case 'multi':
          var message = ' @@ to end:\n'
          this.socket.write(field.promptMessage + message);
          break;
        default:
          this.socket.write(field.promptMessage);
          break;
      }
    }
  }
}

module.exports.new = function(socket, completionCallback) {
  return new prompt(socket, completionCallback);
}

function Field() {
    this.name = '';
    this.type = '';
    this.value = false;
    this.startField = false;
    this.inputCacheName = '';
    this.promptMessage = '';
    this.validationCallback = false;
}
