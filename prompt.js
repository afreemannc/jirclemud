function prompt(socket) {
  this.socket = socket;
  this.fields = {};
  this.currentField = false;
}

prompt.prototype.promptHandler = function(input, connection) {
  var currentPrompt = socket.playerSession.prompt;
  if (typeof currentPrompt.expectedField !== 'undefined') {
    var expectedField = currentPrompt.expectedField;
    this.cacheInput(socket, input);
    if (typeof currentPrompt.fields[expectedField] !== 'undefined') {
      currentField = currentPrompt.fields[expectedField];

    }
  }
}

prompt.prototype.cacheInput = function(socket, inputRaw) {
    var currentPrompt = socket.playerSession.prompt;
    var currentField = socekt.playerSession.prompt.currentField;
    if (typeof socket.playerSession.prompt.fields[currentField].value === 'undefined') {
      this.fields[currentField].value = inputRaw;
    }
    else {
      this.fields[currentField].value.concat(inputRaw);
    }
}

prompt.prototype.addField = function(name, field) {
    this.fields[name] = field;
}

prompt.prototype.start = function() {
  var fields = this.socket.playerSession.prompt.fields;
  for (i = 0; i < fields.length; ++i) {
    field = fields[i];
    if (typeof field.startField !== 'undefined' && field.startField === true) {
      this.socket.playerSession.prompt.currentField = field.name;
      this.socket.playerSession.print(currentField.promptMessage);
    }
  }
}

module.exports.new = function(socket) {
  return new prompt(socket);
}
