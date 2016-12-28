function Multitext() {

  this.name = '';
  this.type = '';
  this.value = [];
  this.promptMessage = '';
  this.validate = false;
  this.validated = false;
  this.conditional = false;
  this.checkConditional = false;

  this.formatPrompt = function(message) {
    this.promptMessage = message + '(@@ to save)' + '\n';
  };

  this.sanitizeInput = false;
  this.validate = false;
  this.validationError = false;

  this.cacheInput = function(input) {
    inputClean = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    if (inputClean !== '@@') {
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
