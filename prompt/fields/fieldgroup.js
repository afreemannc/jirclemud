function FieldGroup() {

  this.name = '';
  this.options = false;
  // Either the user wants to iterate the field group or they don't.
  // Additional options don't make any sense.
  var staticOptions = {y:'Yes', n:'No'};

  this.value = [];
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;
  this.fieldGroup = false;
  this.fields = [];
  // Making this compatible with conditionals is a bigger lift than I'm willing to take
  // at the moment and likely unnecessary in any case.
  this.checkConditional = false;

  this.formatPrompt = function(prefix, replaceInPrefix) {
    this.promptMessage = prefix + '\n';
    var keys = Object.keys(staticOptions);

    for (i = 0; i < keys.length; ++i) {
      if (replaceInPrefix === true) {
        pattern = '[::' + keys[i] + '::]';
        replacement = '[' + global.color.yellow(keys[i].toUpperCase()) + ']';
        this.promptMessage = this.promptMessage.replace(pattern, replacement);
      }
      else {
        this.promptMessage += '[' + global.color.yellow(keys[i].toUpperCase()) + '] ' + staticOptions[keys[i]] + '\n';
      }
    }
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = input.toLowerCase();
    return input;
  }

  this.validate = function(session, input) {
    if (typeof staticOptions[input] !== 'undefined') {
      values = {};
      for (var j = 0; j < this.fields.length; ++j) {
        // Gather up the current values for the fieldgroup fields and stash them in this
        // field as they will be overwritten during the upcoming iteration.
        fieldIndex = session.prompt.getFieldIndex(this.fields[j]);
        if (fieldIndex) {
          field = session.prompt.fields[fieldIndex];
          values[field.name] = field.value;
        }
        else {
          console.log('field not found:' + global.colors.red(this.fields[j]));
        }
      }
      this.value.push(values);
      if (input === 'y') {
        // Reset current field to first field in the field group and prompt the user for input.
        fieldIndex = session.prompt.getFieldIndex(this.fields[0]);
        session.prompt.currentField = session.prompt.fields[fieldIndex];
        session.prompt.promptUser();
        // Halt any additional processing.
        return false;
      }
      else if (input === 'n') {
        return true;
      }
    }
    else {
      this.validationError(session, input);
      return false;
    }
  };


  this.validationError = function(session, input) {
    session.socket.write('"' + input + '" is not a valid option.\n');
  };
  // All the action happens in the validate hook as the player session
  // is required to access the current prompt object.
  this.cacheInput = function() {
    return true;
  };
}

module.exports.new = function() {
  return new FieldGroup();
}
