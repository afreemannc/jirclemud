function Dice() {

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

  this.validate = function(session, input) {
    parts = input.split('d');
    // incorrectly formatted
    if (parts.length < 2) {
      this.validationError(session, input);
      return false;
    }
    // XdY X is not a number
    if (parseInt(parts[0]) === 'NaN') {
      this.validationError(session, input);
      return false;
    }
    // XdY Y is not a number
    if (parseInt(parts[1]) === 'NaN') {
      this.validationError(session, input);
      return false;
    }
    return true;
  };


  this.validationError = function(session, input) {
    session.socket.write('"' + input + '" is not a valid dice format.\n');
  };

  this.cacheInput = function(input) {
    this.value = this.options[input];
    return true;
  };
}

module.exports.new = function() {
  return new Dice();
}
