/**
 * @file Prompt system class and related methods.
 */

function makePrompt(id, session, completionCallback, quittable = true) {
  this.id = id;
  this.session = session;
  this.fields = [];
  this.currentField = false;
  this.completionCallback = completionCallback;
  this.alterCallbacks = [];
  this.quittable = quittable;
  this.fieldGroups = {};

  /**
   * Prompt user for input for current field.
   *
   * @return
   *   Returns true if prompt was displayed, otherwise false.
   */
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
    this.currentField.formatPrompt();
    var message = this.currentField.title;
    if (this.quittable === true) {
      message += Tokens.replace('%yellow% (@q to quit)%yellow%\n');
    }
    this.session.socket.write(Tokens.replace(message));
    return true;
  }

  /**
   * Parse user input while user is interacting with this prompt.
   *
   * @param input
   *   User input.
   *
   */
  this.inputHandler = function(input) {

    if (input.toString().replace(/(\r\n|\n|\r)/gm,"") === '@q' && this.quittable === true) {
      this.session.inputContext = 'command';
      Commands.triggers.look(this.session, '');
      return;
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
      }
      // The current field has completed gathering input.
      console.log('inputComplete:' + inputComplete);
      if (inputComplete) {
        fieldIndex = this.getFieldIndex(this.currentField.name);
        // Iterate past hidden fields if needed.
        while (fieldIndex < this.fields.length - 1) {
          ++fieldIndex;
          var field = this.fields[fieldIndex];
          this.currentField = field;
          if (this.currentField.title !== false) {
            // Conditional fields may not prompt if conditions are not met.
            // In this case promptUser returns false and the current field
            // is skipped.
            prompted = this.promptUser();
            if (prompted === true) {
              console.log('bailed on prompted === true');
              return;
            }
          }
        }
        console.log('fieldIndex:' + fieldIndex);
        console.log('fields length:' + this.fields.length);
        console.log('completion callback typeof:' + typeof this.completionCallback);
        // Complete form submission if we have reached the last available field.
        if (fieldIndex === (this.fields.length - 1) && typeof this.completionCallback === 'function') {
          console.log('prompt completed, invoking completion callback');
          var fieldValues = {};
          for (var i = 0; i < this.fields.length; ++i) {
            fieldValues[this.fields[i].name] = this.fields[i].value;
          }
          // Whatever else happens in the completion callback this prompt has run it's
          // course so it's time to hand input processing back to the command system.
          this.session.inputContext = 'command';
          this.completionCallback(this.session, fieldValues);
        }
      }
    }
  }

  /**
   * Reset to the first field in this prompt.
   */
  this.resetPrompt = function(fieldIndex) {
    if (typeof fieldIndex === 'undefined') {
      for (var i = 0; i < this.fields.length; ++i) {
        this.fields[i].value = false;
      }
      this.currentField = this.fields[0];
    }
    else {
      this.currentField = this.fields[fieldIndex];
    }
  }

  /**
   *  Display an error and reset the prompt if prompt completion callback fails.
   *
   * @param error
   *   Error message to display.
   */
  this.displayCompletionError = function(error) {
    this.resetPrompt(session);
    this.session.socket.write(color.red(error));
    this.start();
  }

  /**
   * Create a new instance of a given field type.
   *
   * @param type
   *   Field type to create.
   */
  this.newField = function(type) {
    var field = this.fieldTypes[type].new;
    return field();
  }

  /**
   * Add a field to this prompt's fields array.
   *
   * @param field
   *   Field object to add.
   */
  this.addField = function(field) {
    this.fields.push(field);
    if (field.fieldGroup !== false) {
      // TODO: replace this with code in fieldgroup cacheInput
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

  /**
   * Look up the numeric index of a given field.
   *
   * @param name
   *   field.name to search for.
   *
   * @return
   *   Returns numeric index of field position in prompt fields array
   *   or false if no field is found.
   */
  this.getFieldIndex = function(name) {
    for (var i = 0; i < this.fields.length; ++i) {
      if (this.fields[i].name === name) {
        return i;
      }
    }
    return false;
  }

  /**
   * Start prompting the user for input.
   */
  this.start = function() {
    this.session.inputContext = 'prompt';
    this.session.prompt = this;
    console.log('fields in prompt start:');
    console.log(this.fields);
    for (var i = 0; i < this.fields.length; ++i) {
      // skip value fields
      if (this.fields[i].formatPrompt !== false) {
        this.currentField = this.fields[i];
        console.log('prompting user on field:');
        console.log(this.currentField);
        this.promptUser(this.currentField);
        break;
      }
    }
  }
}

/**
 * Field type definitions.
 */
makePrompt.prototype.fieldTypes = {
  text: require('../fields/text.js'),
  multitext: require('../fields/multi-text.js'),
  select: require('../fields/select.js'),
  multiselect: require('../fields/multi-select.js'),
  value: require('../fields/value.js'),
  int: require('../fields/int.js'),
  dice: require('../fields/dice.js'),
  fieldgroup: require('../fields/fieldgroup.js')
};


module.exports.new = function(id, session, completionCallback, quittable = true) {
  var newPrompt =  new makePrompt(id, session, completionCallback, quittable);
  return newPrompt;
}
