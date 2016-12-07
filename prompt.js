function prompt(socket, completionCallback) {
  this.socket = socket;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;
  this.promptUser = function(field) {
  switch (field.type) {
    case 'text':
      this.socket.write(field.promptMessage);
      break;
    case 'multi':
      this.socket.write(field.promptMessage + ' (@@ to end)');
      break;
    case 'select':
      var promptMessage = field.promptMessage;
      for (i = 0; i < field.options.length; ++i) {
        option = field.options[i];
        pattern = '::' + (i + 1) + '::';
        replacement = color.yellow(option.toUpperCase());
        promptMessage = promptMessage.replace(pattern, replacement);
      }
      this.socket.write(promptMessage);
      break;

    default:
     this.socket.write('I have no idea what to do here.');
  }
  }
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
    if (currentField.validationCallback !== false && currentField.validated === false) {
      currentField.validationCallback(this.socket, input);
    }
    else {
      // Process the next field. If we are on the last field run the
      // completion callback function. For multi-line fields this gets
      // skipped until the input end sequence @@ is received.
      if (this.cacheInput(input) === true) {
        fieldIndex = currentPrompt.getFieldIndex(currentField.name);
        if (fieldIndex < currentPrompt.fields.length - 1) {
          ++fieldIndex;
          var field = currentPrompt.fields[fieldIndex];
          this.socket.playerSession.prompt.currentField = field;
          this.socket.playerSession.prompt.promptUser(field);
        }
        else {
          if (currentPrompt.completionCallback !== false) {
             var fieldValues = {};
             for (i = 0; i < currentPrompt.fields.length; ++i) {
               fieldValues[currentPrompt.fields[i].name] = this.socket.playerSession.prompt.fields[i].value;
             }
             currentPrompt.completionCallback(this.socket, fieldValues, false, false);
          }
        }
      }
    }
  }
  else {
    console.log('wtf is going on with the current field?');
  }
}

prompt.prototype.validationError = function(error) {
  this.socket.write(color.red(error));
  this.promptUser(this.currentField);
}

// Flag current field as validated and re-fire the prompt handler to
// cache the input and move to the next field.
prompt.prototype.validationSuccess = function(fieldName, input) {
  var index = this.getFieldIndex(fieldName);
  this.socket.playerSession.prompt.fields[index].validated = true;
  this.promptHandler(input);
}

/**
 * Set active prompt and begin prompting user for input.
 */
prompt.prototype.setActivePrompt = function(newPrompt) {
  this.socket.playerSession.prompt = newPrompt;
  this.start();
}

/**
 * Save user input in the value property of the current prompt field.
 */
prompt.prototype.cacheInput = function(inputRaw) {
  var currentField = this.socket.playerSession.prompt.currentField;
  var index = this.getFieldIndex(currentField['name']);
  var input = inputRaw.toString().replace(/(\r\n|\n|\r)/gm,"");
  switch (currentField.type) {
    case 'text':
      this.socket.playerSession.prompt.fields[index].value = input;
      return true;
    case 'select':
      input = input.toLowerCase();
      var stuff = currentField.options.indexOf(input);
      if (currentField.options.indexOf(input) !== -1) {
        this.socket.playerSession.prompt.fields[index].value = input;
        return true;
      }
      else {
        this.socket.playerSession.prompt.validationError('"' + input + '" is not a valid choice.\n');
        return false;
      }
    case 'multi':
      if (input !== '@@') {
        this.socket.playerSession.prompt.fields[index].value += inputRaw;
        return false;
      }
      else {
        return true;
      }
    default:
      console.log('this should not happen');
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
      console.log(this.socket.playerSession.prompt);
      this.socket.playerSession.prompt.promptUser(field);
    }
  }
}

module.exports.new = function(socket, completionCallback) {
  return new prompt(socket, completionCallback);
}

function Field() {
    this.name = '';
    this.type = '';
    this.options = false;
    this.value = false;
    this.startField = false;
    this.inputCacheName = '';
    this.promptMessage = '';
    this.validationCallback = false;
    this.validated = false;
}
