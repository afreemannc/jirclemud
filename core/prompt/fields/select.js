function Select() {

  this.name = '';
  this.options = {};
  this.value = false;
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;
  this.fieldGroup = false;

  this.checkConditional = function(input) {
    if (Array.isArray(input)) {
      for (i = 0; i < input.length; ++i) {
        if (this.value === input[i]) {
          return true;
        }
      }
      return false;
    }
    else {
      if (this.value === input) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  this.formatPrompt = function(prefix, replaceInPrefix) {
    this.promptMessage = prefix + '\n';
    var keys = Object.keys(this.options);

    for (i = 0; i < keys.length; ++i) {
      if (replaceInPrefix === true) {
        pattern = '[::' + keys[i] + '::]';
        replacement = '[' + global.color.yellow(keys[i].toUpperCase()) + ']';
        this.promptMessage = this.promptMessage.replace(pattern, replacement);
      }
      else {
        this.promptMessage += '[' + global.color.yellow(keys[i].toUpperCase()) + '] ' + this.options[keys[i]] + '\n';
      }
    }
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = input.toLowerCase();
    return input;
  }

  this.validate = function(session, input) {
    if (typeof this.options[input] !== 'undefined') {
        return true;
    }
    else {
      this.validationError(session, input);
      return false;
    }
  };


  this.validationError = function(session, input) {
    session.socket.write('"' + input + '" is not a valid option.\n');
  };

  this.cacheInput = function(input) {
    this.value = this.options[input];
    return true;
  };
}

module.exports.new = function() {
  return new Select();
}