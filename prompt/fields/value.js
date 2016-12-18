function Value() {

  this.name = '';
  this.type = '';
  this.value = false;
  this.startField = false;
  this.promptMessage = false;
  this.validated = true;
  this.formatPrompt = false;
  this.sanitizeInput = false;
  this.validate = false;
  this.validationError = false;
  this.cacheInput = false;
}

module.exports.new = function() {
  return new Value();
}
