function Select() {

  this.name = '';
  this.options = {};
  this.value = false;
  this.title = '';
  this.validated = false;
  this.conditional = false;
  this.fieldGroup = false;
  this.saveRawInput = false;
  this.replaceInPrefix = false;

  this.checkConditional = function(input) {
    if (Array.isArray(input)) {
      for (var i = 0; i < input.length; ++i) {
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

  this.formatPrompt = function() {
    this.title = this.title + '\n';
    var keys = Object.keys(this.options);
    console.log('replace:' + this.replaceInPrefix);
    for (var i = 0; i < keys.length; ++i) {
      if (this.replaceInPrefix === true) {
        pattern = '[::' + keys[i] + '::]';
        replacement = '[%yellow%' + keys[i].toUpperCase() + '%yellow%]';
        this.title = this.title.replace(pattern, replacement);
      }
      else {
        this.title += '[%yellow%' + keys[i].toUpperCase() + '%yellow%] ' + this.options[keys[i]] + '\n';
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
    if (this.saveRawInput === true) {
      this.value = input;
    }
    else {
      this.value = this.options[input];
    }
    return true;
  };
}

module.exports.new = function() {
  return new Select();
}
