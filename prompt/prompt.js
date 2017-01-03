function Prompt(session, completionCallback) {
  this.session = session;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;
  this.quittable = true;
  this.fieldGroups = {};

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
    console.log(this.currentField);
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
      message += global.colors.yellow(' (@q to quit)\n');
    }
    this.session.socket.write(message);
    return true;
  }

  this.promptHandler = function(input) {
    if (input.toString().replace(/(\r\n|\n|\r)/gm,"") === '@q' && this.quittable === true) {
      this.session.inputContext = 'command';
      global.commands.triggers.look(this.session, '');
      console.log('prompt bailout');
      return;
    }
    // Special handling for fieldGroup placeholder fields.
    if (this.getFieldIndex(this.currentField.name) === false) {
      // Placeholder found
      var fieldGroup = this.currentField.name;
      input = this.currentField.sanitizeInput(input);
      if (input === 'y') {
        for (i = 0; i < this.fields.length; ++i) {
          field = this.fields[i];
          if (field.fieldGroup === fieldGroup) {
            this.fieldGroups[fieldGroup][delta]++;
            this.currentField = field;
            this.promptUser(field);
            return true;
          }
        }
      }
      else if (input === 'n') {
        var endOn = this.fieldGroups[this.currentField.name].endOn;
        fieldIndex =  this.getFieldIndex(endOn);
        if (fieldIndex < this.fields.length - 1) {
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
        }
        else {
          // Complete form submission if we have reached the last available field.
          if (typeof this.completionCallback === 'function') {
            var fieldValues = {};
            for (i = 0; i < this.fields.length; ++i) {
              fieldValues[this.fields[i].name] = this.fields[i].value;
            }
            fieldValues.fieldGroups = this.fieldGroups;
            this.completionCallback(this.session, fieldValues);
            return true;
          }
        }
        return true;
      }

    }


    var inputComplete = false;
    if (typeof this.currentField !== 'undefined') {
      if (typeof this.currentField.sanitizeInput === 'function') {
        input = this.currentField.sanitizeInput(input);
      }
      // Custom validation handlers can be used by overwriting the default .validate function on the field object.
      if (typeof this.currentField.validate === 'function') {
        if (this.currentField.validate(session, input)) {
          inputComplete = this.currentField.cacheInput(input);
        }
      }
      else {
        inputComplete = this.currentField.cacheInput(input);
        console.log('inputComplete: ' + inputComplete);
      }
      // The current field has completed gathering input.
      if (inputComplete) {
        // If this field is in a field group the current field value needs to be added
        // to the field group values
        if (this.currentField.fieldGroup !== false) {
          fieldGroup = this.currentField.fieldGroup;
          delta = this.fieldGroups[fieldGroup].delta;
          if (typeof this.fieldGroups[fieldGroup].values[delta] === 'undefined') {
            this.fieldGroups[fieldGroup].values[delta] = {};
          }
          this.fieldGroups[fieldGroup].values[delta][this.currentField.name] = this.currentField.value;

          if (this.fieldGroups[fieldGroup].endOn === this.currentField.name) {
            // Set current field to a placeholder so user input doesn't overwrite prior data entered.
             this.fieldGroupPrompt(session, fieldGroup);
             return true;
          }
        }

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
          fieldValues.fieldGroups = this.fieldGroups;
          console.log('field values:');
          console.log(fieldValues);
          this.completionCallback(this.session, fieldValues);
        }
      }
    }
  }

  this.fieldGroupPrompt = function(session, fieldGroup) {
    var placeHolderField = this.newField('select');
    placeHolderField.name = fieldGroup;
    placeHolderField.checkConditional = false;
    placeHolderField.options = {y:'yes', n:'no'},
    placeHolderField.formatPrompt('Add another?\n[::y::]es, [::n::]o', true);
    this.currentField = placeHolderField;
    session.prompt.promptUser(placeHolderField);
  }

  this.resetPrompt = function(fieldIndex) {
    if (typeof fieldIndex === 'undefined') {
      for (i = 0; i < this.fields.length; ++i) {
        this.fields[i].value = false;
      }
      this.currentField = this.fields[0];
    }
    else {
      this.currentField = this.fields[fieldIndex];
    }
  }


  this.displayCompletionError = function(error) {
    this.resetPrompt(session);
    this.session.socket.write(color.red(error));
    this.start();
  }

  this.newField = function(type) {
    var field = this.fieldTypes[type].new;
    return field();
  }

  this.addField = function(field) {
    this.fields.push(field);
    if (field.fieldGroup !== false) {
      if (typeof this.fieldGroups[field.fieldGroup] === 'undefined') {
        this.fieldGroups[field.fieldGroup] = {
          delta: 0,
          values: [],
          endOn: field.name
        }
      }
      else {
        // This is cheap but since we're iterating anyway may as well let this
        // overwrite automatically until the last field in the group is added.
        this.fieldGroups[field.fieldGroup].endOn = field.name;
      }
    }
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
    this.session.inputContext = 'prompt';
    this.session.prompt = this;
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

module.exports.new = function(session, completionCallback) {
  return new Prompt(session, completionCallback);
}
