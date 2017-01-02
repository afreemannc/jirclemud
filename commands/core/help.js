var Command = function() {
  this.trigger = 'help';
  this.helpText = 'Are you for real?';
  this.callback = function (session, input) {
    if (input === '') {
      var output = 'There is help for the following commands:\n\n';
      var keys = Object.keys(global.commands.commands);

      for (i = 0; i < keys.length; ++i) {
        command = global.commands.commands[keys[i]];
        if (command.helpText !== '') {
          output += command.trigger.toUpperCase() + '\n';
        }
      }
      session.write(output);
      return;
    }
    if (typeof global.commands.commands[input] !== 'undefined') {
      var command = global.commands.commands[input];
      // Valid commands may have their help text intentionally blanked
      if (command.helpText !== '') {
        var helpText = '%cyan%Help topic [' + input + ']%cyan%\n';
        helpText += command.helpText;
        session.write(global.tokens.replace(session, helpText));
      }
      else {
        session.write('There is no help for that term.');
      }
    }
    else {
      session.write('There is no help for that term.');
    }
  }
}

module.exports = new Command();
