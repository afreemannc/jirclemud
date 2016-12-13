function Prompt(socket, completionCallback) {
  this.socket = socket;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;

  this.fieldTypes = {
    text: require('./fields/text.js'),
    multiText: require('./fields/multi-text.js'),
    select: require('./fields/select.js'),
    multiSelect: require('./fields/multi-select.js')
  },

  this.promptUser = function() {
    this.socket.write(this.currentField.promptMessage);
  }

  this.promptHandler = function(input) {
    console.log('prompt handler input:' + input);
    var inputComplete = false;
    if (typeof this.currentField !== 'undefined') {
      if (typeof this.currentField.sanitizeInput === 'function') {
        input = this.currentField.sanitizeInput(input);
      }
      // Process the next field. If we are on the last field run the
      // completion callback function. For multi-line fields this gets
      // skipped until the input end sequence @@ is received.
      if (typeof this.currentField.validate === 'function') {
        console.log('calling validation with input:' + input);
        if (this.currentField.validate(input)) {
          inputComplete = this.currentField.cacheInput(input);
        }
      }
      else {
        inputComplete = this.currentField.cacheInput(input);
      }

      // The current field has completed gathering input.
      if (inputComplete) {
        fieldIndex = this.getFieldIndex(this.currentField.name);
        // Prompt user for input on  next field if available.
        if (fieldIndex < this.fields.length - 1) {
          ++fieldIndex;
          var field = this.fields[fieldIndex];
          this.currentField = field;
          this.promptUser(field);
        }
        // Otherwise complete the form submission.
        else {
          if (this.completionCallback !== false) {
             var fieldValues = {};
             for (i = 0; i < this.fields.length; ++i) {
               fieldValues[this.fields[i].name] = this.fields[i].value;
             }
             this.completionCallback(this.socket, fieldValues);
          }
        }
      }
    }
  }

  this.resetPrompt = function() {
    for (i = 0; i < this.fields.length; ++i) {
      this.fields[i].value = false;
      if (this.fields[i].startField === true) {
        this.currentField = fields[i];
      }
    }
  }


  this.displayCompletionError = function(error) {
    this.resetPrompt(socket);
    this.socket.write(color.red(error));
    this.start();
  }

  this.newField = function(type) {
    console.log('type:' + type);
    console.log(this.fieldTypes);
    console.log(this.fieldTypes[type]);
    field = this.fieldTypes[type].new;
    console.log('field:');
    console.log(field);
    return field();
  }

  this.addField = function(field) {
    this.fields.push(field);
  }


  this.getFieldIndex = function(name) {
    for (i = 0; i < this.fields.length; ++i) {
      if (this.fields[i].name === name) {
        return i;
      }
    }
    return false;
  }

  this.start = function() {
    this.socket.playerSession.inputContext = 'prompt';
    this.socket.playerSession.prompt = this;
    for (i = 0; i < this.fields.length; ++i) {
      field = this.fields[i];
      if (typeof field.startField !== 'undefined' && field.startField === true) {
        this.currentField = field;
        this.promptUser(field);
      }
    }
  }
}

module.exports.new = function(socket, completionCallback) {
  return new Prompt(socket, completionCallback);
}
