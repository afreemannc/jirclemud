function Int() {

  this.name = '';
  this.type = '';
  this.value = false;
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;

  this.checkConditional = function(input) {
    if (this.value === input) {
      return true;
    }
    else {
      return false;
    }
  }

  this.formatPrompt = function(message) {
    this.promptMessage =  message + '\n';
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    return parseInt(input);
  }

  this.validate = function(input) {
    if (Number.isInteger(input)) {
      return true;
    }
    else {
      this.validationError(socket, input);
      return false;
    }
  }

  this.validationError = function(socket, input) {
    socket.write('"' + input + '" is not a number.\n');
  };


  this.cacheInput = function(input) {
    this.value = input;
    return true;
  };
}

module.exports.new = function() {
  return new Int();
}
