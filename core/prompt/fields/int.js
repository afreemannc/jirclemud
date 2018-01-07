function Int() {

  this.name = '';
  this.type = '';
  this.maxint = false;
  this.value = false;
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;
  this.fieldGroup = false;
  this.replaceInPrefix = false;

  this.checkConditional = function(input) {
    if (this.value === input) {
      return true;
    }
    else {
      return false;
    }
  }

  this.formatPrompt = function(message) {
    if (this.maxint === false) {
      this.promptMessage =  message + '\n';
    }
    else {
      this.promptMessage = message + ' (max: ' + this.maxint + ')\n';
    }
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    return parseInt(input);
  }

  this.validate = function(session, input) {
    if (Number.isInteger(input)) {
      if (this.maxint !== false) {
        if (input <= this.maxint) {
          return true;
        }
        else {
          return false;
        }
      }
      return true;
    }
    else {
      this.validationError(session, input);
      return false;
    }
  }

  this.validationError = function(session, input) {
    if (this.maxint === false) {
      session.socket.write('"' + input + '" is not a number.\n');
    }
    else if (this.maxint > input) {
      session.socket.write('"' + input + '" is larger than the max value allowed.\n');
    }
    else {
      session.socket.write('"' + input + '" is not a number.\n');
    }
  };


  this.cacheInput = function(input) {
    this.value = input;
    return true;
  };
}

module.exports.new = function() {
  return new Int();
}
