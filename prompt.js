function prompt(socket) {
  this.socket = socket;
  this.fields = [];
  this.currentField = false;
}

prompt.prototype.promptHandler = function(input, connection) {
  var currentPrompt = this.socket.playerSession.prompt;
  if (typeof currentPrompt.currentField !== 'undefined') {
    var currentField = currentPrompt.currentField;
    console.log(currentField);
    if (typeof currentField.validationCallback !== 'undefined') {
      switch (currentPrompt.context) {
        case 'user':
          console.log(global.user);
          validationCallback = currentField.validationCallback;
          console.log('validation callback:' + validationCallback + ':');
          global.user[validationCallback](this.socket, input);
          break;
      }
    }
    else {
      this.cacheInput(input);
      if (typeof currentField.nextField !== 'undefined') {
        var fields = this.socket.playerSession.prompt.fields;
        for (i = 0; i < fields.length; ++i) {
          var field = fields[i];
          if (field.name === currentField.nextField) {
            this.socket.playerSession.prompt.currentField = field;
            this.socket.write(field.promptMessage);
          }
        }
      }
    }

  }
}

prompt.prototype.cacheInput = function(inputRaw) {
    var currentPrompt = this.socket.playerSession.prompt;
    var currentField = this.socket.playerSession.prompt.currentField;
    index = this.getFieldIndex(currentField['name']);

    if (typeof currentField.value === 'undefined') {
      this.socket.playerSession.prompt.fields[index].value = inputRaw;
    }
    else {
      this.socket.playerSession.prompt.fields[index].value += inputRaw;
    }
}

prompt.prototype.addField = function(field) {
    this.fields.push(field);
}

prompt.prototype.getFieldIndex = function(name) {
  fields = this.fields;
  console.log('index fields:');
  console.log(fields);
  console.log('name:' + name);
  for (i = 0; i < fields.lenth; ++i) {
    if (fields[i].name === 'name') {
      return i;
    }
  }
  return false;
}

prompt.prototype.start = function() {
  this.socket.playerSession.inputContext = 'prompt';
  var fields = this.socket.playerSession.prompt.fields;
  for (i = 0; i < fields.length; ++i) {
    field = fields[i];
    if (typeof field.startField !== 'undefined' && field.startField === true) {
      this.socket.playerSession.prompt.currentField = field;
      this.socket.write(field.promptMessage);
    }
  }
}

module.exports.new = function(socket) {
  return new prompt(socket);
}
