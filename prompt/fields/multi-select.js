function Multiselect(socket) {
  this.socket = socket;
  this.name = '';
  this.type = '';
  this.options = {};
  this.value = [];
  this.startField = false;
  this.promptMessage = '';
  this.validated = false;


  this.formatPrompt = function(prefix, replaceInPrefix) {
    this.promptMessage = prefix + '\n';
    var keys = Object.keys(this.options);

    for (i = 0; i < keys.length; ++i) {
      if (replaceInPrefix === true) {
        pattern = '[::' + keys[i] + '::]';
        replacement = '[' + global.color.yellow(keys[i].toUpperCase()) + ']';
        this.promptMessage = this.promptMessage.replace(pattern, replacement);
      }
      else {
        this.promptMessage = '[' + global.color.yellow(keys[i].toUpperCase()) + '] ' + this.options[keys[i]] + '\n';
      }
    }
    this.promptMessage += '(@@ to finalize selections)\n';
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = input.toLowerCase();
    return input;
  }

  this.validate = function(socket, input) {
    if (input !== '@@') {
      if (typeof this.options[input] !== 'undefined') {
        return false;
      }
      else {
         this.validationError(socket, input);
      }
    }
    else {
      return true;
    }
  };

  this.validationError = function(socket, input) {
    socket.write('"' + input + '" is not a valid option.\n');
    global.prompt.promptUser(this);
  };

  this.cacheInput = function(input) {
    if (input !== '@@') {
      this.value.push(this.options[input]);
      var selected = this.value.join(', ');
      this.socket.write('Currently selected:' + selected + '\n');
      return false;
    }
    else {
      return true;
    }
  };
}

module.exports.new = function() {
  return new Multiselect();
}
