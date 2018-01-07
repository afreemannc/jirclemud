function Multiselect() {

  this.name = '';
  this.type = '';
  this.options = {};
  this.value = [];
  this.promptMessage = '';
  this.validated = false;
  this.conditional = false;
  this.fieldGroup = false;
  this.saveRawInput = false;
  this.replaceInPrefix = false;

  this.checkConditional = function(input) {
    if (Array.isArray(input)) {
      for (var i = 0; i < input.length; ++i) {
        if (this.value.includes(input[i])) {
          return true;
        }
      }
      return false;
    }
    else {
      if (this.value.includes(input) === true) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  this.formatPrompt = function(prefix) {
    this.promptMessage = prefix + '\n';
    var keys = Object.keys(this.options);

    for (var i = 0; i < keys.length; ++i) {
      if (this.replaceInPrefix === true) {
        pattern = '[::' + keys[i] + '::]';
        replacement = '[%yellow%' + keys[i].toUpperCase() + '%yellow%]';
        this.promptMessage = this.promptMessage.replace(pattern, replacement);
      }
      else {
        this.promptMessage += '[%yellow%' + keys[i].toUpperCase() + '%yellow%] ' + this.options[keys[i]] + '\n';
      }
    }
    this.promptMessage += '(@@ to finalize selections)\n';
  };

  this.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = input.toLowerCase();
    return input;
  }

  this.validate = function(session, input) {
    if (input !== '@@') {
      if (typeof this.options[input] !== 'undefined') {
        if (this.saveRawInput === true) {
          this.value.indexOf(input);
        }
        else {
          var index = this.value.indexOf(this.options[input]);
        }
        var value = this.value.slice();
        // unset in display on double entry
        console.log('index:' + index);
        if (index >= 0) {
          value.splice(index, 1);
        }
        else {
          // add selection to display
          if (this.saveRawInput === 'input') {
            value.push(input);
          }
          else {
            value.push(this.options[input]);
          }
        }
        var selected = value.join(', ');
        session.socket.write('Currently selected:' + selected + '\n');
        return true;
      }
      else {
         this.validationError(session, input);
         return false;
      }
    }
    else {
      return true;
    }
  };

  this.validationError = function(session, input) {
    session.socket.write('"' + input + '" is not a valid option.\n');
    session.prompt.promptUser(this);
  };

  this.cacheInput = function(input) {
    if (input !== '@@') {
      // unset in cached value on double entry
      if (this.saveRawInput === true) {
        var index = this.value.indexOf(input);
      }
      else {
        var index = this.value.indexOf(this.options[input]);
      }
      if (index >= 0) {
        this.value.splice(index, 1);
      }
      else {
        if (this.saveRawInput === true) {
          this.value.push(input);
        }
        else {
          this.value.push(this.options[input]);
        }
      }
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
