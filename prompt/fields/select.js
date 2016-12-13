function Select(socket) {

  this.socket = socket;
  this.name = '';
  this.options = {};
  this.value = false;
  this.startField = false;
  this.promptMessage = '';
  this.validated = false;

  this.formatPrompt = function(prefix, replaceInPrefix) {
    this.promptMessage = prefix + '\n';
    var keys = Object.keys(this.options);

    for (i = 0; i < keys.length; ++i) {
      if (replaceInPrefix === true) {
        pattern = '[::' + keys[i] + '::]';
        replacement = '[' + global.color.yellow(keys[i].toUpperCase()) + ']';
        this.promptMessage = promptMessage.replace(pattern, replacement);
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

  this.validate = function(input) {
    if (typeof this.options[input] !== 'undefined') {
        return true;
    }
    else {
      this.validationError();
      return false;
    }
  };


  this.validationError = function(input) {
    socket.write('"' + input + '" is not a valid option.\n');
    global.prompt.promptUser(this);
  };

  this.cacheInput = function(input) {
    this.value = this.options[input];
    return true;
  };
}

module.exports.new = function() {
  return new Select();
}