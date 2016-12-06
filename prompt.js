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
  console.log('prompt handler invoked with input:' + input);
  var currentPrompt = this.socket.playerSession.prompt;
  if (typeof currentPrompt.currentField !== 'undefined') {
    var currentField = currentPrompt.currentField;
    console.log('current field:');
    console.log(currentField);
    // If the current field has a validation callback
    // invoke it before input is cached. This callback
    // will be responsible for returning execution to this
    // function to complete caching input if needed.
    if (currentField.validationCallback !== false && currentField.validated === false) {
      console.log('invoking validation callback');
      currentField.validationCallback(this.socket, input);
    }
    else {
      console.log('moving to next field');
      // Process the next field. If we are on the last field run the
      // completion callback function. For multi-line fields this gets
      // skipped until the input end sequence @@ is received.
      if (this.cacheInput(input) === true) {
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
  else {
    console.log('wtf is going on with the current field?');
  }
}

prompt.prototype.validationError = function(error) {
  this.socket.write(color.red(error));
  this.socket.write(this.currentField.promptMessage);
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
  console.log('set active invoked');
  this.socket.playerSession.prompt = newPrompt;
  this.start();
}

/**
 * Save user input in the value property of the current prompt field.
 */
prompt.prototype.cacheInput = function(inputRaw) {
  var currentField = this.socket.playerSession.prompt.currentField;
  console.log('input:' + inputRaw + ':');
  console.log('current field:');
  console.log(currentField);
  var index = this.getFieldIndex(currentField['name']);
  var input = inputRaw.toString().replace(/(\r\n|\n|\r)/gm,"");
  if (currentField.type === 'text') {
    console.log('field type is text, stashed value and returned true');
    this.socket.playerSession.prompt.fields[index].value = input;
    return true;
  }
  else if(currentField.type === 'multi' && input !== '@@') {
    this.socket.playerSession.prompt.fields[index].value += inputRaw;
    return false;
  }
  else if (input === '@@') {
    return true;
  }
  else {
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
  console.log('start invoked');
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
    this.validated = false;
}
