function Prompt(socket, completionCallback) {
  this.socket = socket;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;
  this.quittable = true;

  this.fieldTypes = {
    text: require('./fields/text.js'),
    multitext: require('./fields/multi-text.js'),
    select: require('./fields/select.js'),
    multiselect: require('./fields/multi-select.js')
  },

  this.promptUser = function() {
    var message = this.currentField.promptMessage;
    if (this.quittable === true) {
      message += global.colors.yellow('(@q to quit)\n');
    }
    this.socket.write(message);
  }

  this.promptHandler = function(input) {
    if (input.toString().replace(/(\r\n|\n|\r)/gm,"") === '@q' && this.quittable === true) {
      this.socket.playerSession.inputContext = 'command';
      global.commands.triggers.look(this.socket, '');
      console.log('prompt bailout');
      return;
    }
    var inputComplete = false;
    if (typeof this.currentField !== 'undefined') {
      if (typeof this.currentField.sanitizeInput === 'function') {
        input = this.currentField.sanitizeInput(input);
      }
      // Custom validation handlers can be used by overwriting the default .validate function on the field object.
      if (typeof this.currentField.validate === 'function') {
        if (this.currentField.validate(socket, input)) {
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
        this.currentField = this.fields[i];
      }
    }
  }


  this.displayCompletionError = function(socket, error) {
    this.resetPrompt(socket);
    this.socket.write(color.red(error));
    this.start();
  }

  this.newField = function(type) {
    console.log('type:' + type);
    console.log('available types');
    console.log(this.fieldTypes);
    console.log('type field object:');
    console.log(this.fieldTypes[type]);
    field = this.fieldTypes[type].new;
    console.log('new field:');
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
