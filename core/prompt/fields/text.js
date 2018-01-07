function Text() {

  this.name = '';
  this.type = '';
  this.value = false;
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;
  this.checkConditional = false;
  this.fieldGroup = false;
  this.replaceInPrefix = false;

  this.formatPrompt = function(message) {
    this.promptMessage =  message + '\n';
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    return input;
  }

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
