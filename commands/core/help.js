var Command = function() {
  this.trigger = 'help';
  this.helpText = 'Are you for real?';
  this.callback = function (session, input) {
    if (input === '') {
      var output = 'There is help for the following commands:\n\n';
      var keys = Object.keys(Commands.commands);

      for (var i = 0; i < keys.length; ++i) {
        command = Commands.commands[keys[i]];
        if (command.helpText !== '') {
          output += command.trigger.toUpperCase() + '\n';
        }
      }
      session.write(output);
      return;
    }
    if (typeof Commands.commands[input] !== 'undefined') {
      var command = Commands.commands[input];
      // Valid commands may have their help text intentionally blanked
      if (command.helpText !== '') {
        var helpText = '%cyan%Help topic [' + input + ']%cyan%\n';
        helpText += command.helpText;
        session.write(Tokens.replace(session, helpText));
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
