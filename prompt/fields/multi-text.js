function Multitext() {

  this.name = '';
  this.type = '';
  this.value = [];
  this.startField = false;
  this.promptMessage = '';
  this.validate = false;
  this.validated = false;

  this.formatPrompt = function(message) {
    this.promptMessage = message + '(@@ to save)' + '\n';
  };

  this.sanitizeInput = false;

  this.validate = function(socket, input) {
    if (input !== '@@') {
      return false;
    }
    else {
      return true;
    }
  };

  this.validationError = false;

  this.cacheInput = function(input) {
    if (input !== '@@') {
      this.value += input;
      return false;
    }
    else {
      return true;
    }
  };
}

module.exports.new = function() {
  return new Multitext();
}
