function Text() {

  this.name = '';
  this.type = '';
  this.value = false;
  this.startField = false;
  this.promptMessage = '';
  this.validated = false;


  this.formatPrompt = function(message) {
    this.promptMessage = message + '\n';
  };
  this.sanitizeInput = false;
  this.validate = false;
  this.validationError = false;

  this.cacheInput = function(input) {
    this.value = input;
    return true;
  };
}

module.exports.new = function() {
  return new Text();
}
