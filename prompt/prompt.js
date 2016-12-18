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
    console.log('current field:');
    console.log(this.currentField);
    this.socket.write(this.currentField.promptMessage);
  }

  this.promptHandler = function(input) {
    console.log('prompt handler input:' + input);
    var inputComplete = false;
    if (typeof this.currentField !== 'undefined') {
      if (typeof this.currentField.sanitizeInput === 'function') {
        input = this.currentField.sanitizeInput(input);
      }
      // Custom validation handlers can be used by overwriting the default .validate function on the field object.
      if (typeof this.currentField.validate === 'function') {
        console.log('calling validation with input:' + input);
        if (this.currentField.validate(socket, input)) {
          inputComplete = this.currentField.cacheInput(input);
        }
      }
      else {
        inputComplete = this.currentField.cacheInput(input);
      }
      console.log('input complete:' + inputComplete);
      // The current field has completed gathering input.
      if (inputComplete) {
        fieldIndex = this.getFieldIndex(this.currentField.name);
        console.log('field index:' + fieldIndex);
        console.log('length:' + this.fields.length);
        // Prompt user for input on  next field if available.
        if (fieldIndex < this.fields.length - 1) {
          ++fieldIndex;
          var field = this.fields[fieldIndex];
          this.currentField = field;
          this.promptUser(field);
        }
        // Otherwise complete the form submission.
        else {
          console.log('calling prompt completion callback');
          if (typeof this.completionCallback === 'function') {
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
    console.log('start triggered');
    this.socket.playerSession.inputContext = 'prompt';
    this.socket.playerSession.prompt = this;
    for (i = 0; i < this.fields.length; ++i) {
      field = this.fields[i];
      if (typeof field.startField !== 'undefined' && field.startField === true) {
        console.log('start field:');
        console.log(field);
        this.currentField = field;
        this.promptUser(field);
        break;
      }
    }
  }
}

module.exports.new = function(socket, completionCallback) {
  return new Prompt(socket, completionCallback);
}
