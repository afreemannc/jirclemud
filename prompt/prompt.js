function Prompt(socket, completionCallback) {
  this.socket = socket;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;
  this.quittable = true;

  // TODO: this could probably be replaced with a loader.
  this.fieldTypes = {
    text: require('./fields/text.js'),
    multitext: require('./fields/multi-text.js'),
    select: require('./fields/select.js'),
    multiselect: require('./fields/multi-select.js'),
    value: require('./fields/value.js'),
    int: require('./fields/int.js'),
    dice: require('./fields/dice.js')
  },

  this.promptUser = function() {
    // Skip prompting on conditional fields where condition is not met
    if (typeof this.currentField.conditional === 'object') {
      var field = this.currentField.conditional.field;
      var value = this.currentField.conditional.value;
      var fieldIndex = this.getFieldIndex(field);
      var targetField = this.fields[fieldIndex];

      if (targetField.checkConditional(value) === false) {
        // conditional not met, do not prompt
        return false;
      }
    }
    var message = this.currentField.promptMessage;
    if (this.quittable === true) {
      message += global.colors.yellow('(@q to quit)\n');
    }
    this.socket.write(message);
    return true;
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
        console.log('inputComplete: ' + inputComplete);
      }
      // The current field has completed gathering input.
      if (inputComplete) {
        fieldIndex = this.getFieldIndex(this.currentField.name);
        // Iterate past hidden fields if needed.
        while (fieldIndex < this.fields.length - 1) {
          ++fieldIndex;
          var field = this.fields[fieldIndex];
          this.currentField = field;
          if (this.currentField.promptMessage !== false) {
            // Conditional fields may not prompt if conditions are not met.
            // In this case promptUser returns false and the current field
            // is skipped.
            prompted = this.promptUser(field);
            if (prompted === true) {
              return;
            }
          }
        }
        // Complete form submission if we have reached the last available field.
        if (fieldIndex === (this.fields.length - 1) && typeof this.completionCallback === 'function') {
          var fieldValues = {};
          for (i = 0; i < this.fields.length; ++i) {
            fieldValues[this.fields[i].name] = this.fields[i].value;
          }
          this.completionCallback(this.socket, fieldValues);
        }
      }
    }
  }

  this.resetPrompt = function() {
    for (i = 0; i < this.fields.length; ++i) {
      this.fields[i].value = false;
    }
    this.currentField = this.fields[0];
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
      // skip value fields
      if (this.fields[i].formatPrompt !== false) {
        this.currentField = this.fields[i];
        this.promptUser(this.currentField);
        break;
      }
    }
  }
}

module.exports.new = function(socket, completionCallback) {
  return new Prompt(socket, completionCallback);
}
