function Multiselect(socket) {
  this.socket = socket;
  this.name = '';
  this.type = '';
  this.options = {};
  this.value = [];
  this.startField = false;
  this.promptMessage = '';
  this.validated = false;

  this.formatPrompt = function(lede, options) {
    this.promptMessage = lede + '\n';
    var keys = Object.keys(options);
    for (i = 0; i < keys.length; ++i) {
      this.promptMessage += '[' + global.color.yellow(keys[i].toUpperCase()) + '] ' + options[keys[i]] + '\n';
    }
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = input.toLowerCase();
    return input;
  }

  this.validate = function(input) {
    if (input !== '@@') {
      if (typeof this.options[input] !== 'undefined') {
        return false;
      }
    }
    else {
      return true;
    }
  };

  this.validationError = false;

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
