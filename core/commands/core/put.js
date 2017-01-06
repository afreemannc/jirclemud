var Command = function() {
  this.trigger = 'put';
  this.helpText = '';
  this.callback = function(session, input) {
    console.log('input:' + input);
    // Route command based on input format
    if (input.includes(' in ')) {
      var commandParts = input.split(' in ');
      // One or more arguments missing
      if (commandParts.length < 2) {
        session.error('Put what where?');
        return;
      }
      else {
        var itemName = commandParts[0];
      }
    }
    else {
      // TODO: work out put <thing> <bag>.
    }
  }
}

module.exports = new Command();
