function Dice(socket) {

  this.socket = socket;
  this.name = '';
  this.options = {};
  this.value = false;
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;
  this.checkConditional = false;
  this.fieldGroup = false;

  this.formatPrompt = function(prefix, replaceInPrefix) {
    this.promptMessage = prefix + '  (ex: 1d6, 2d8, etc)\n';
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = input.toLowerCase();
    return input;
  }

  this.validate = function(socket, input) {
    parts = input.split('d');
    // incorrectly formatted
    if (parts.length < 2) {
      this.validationError(socket, input);
      return false;
    }
    // XdY X is not a number
    if (Number.isInteger(parts[0]) === false) {
      this.validationError(socket, input);
      return false;
    }
    // XdY Y is not a number
    if (Number.isInteger(parts[1]) === false) {
      this.validationError(socket, input);
      return false;
    }
    return true;
  };


  this.validationError = function(socket, input) {
    socket.write('"' + input + '" is not a valid dice format.\n');
  };

  this.cacheInput = function(input) {
    this.value = this.options[input];
    return true;
  };
}

module.exports.new = function() {
  return new Dice();
}
