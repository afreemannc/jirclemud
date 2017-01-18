var Command = function() {
  this.trigger = 'help';
  this.helpText = 'Are you for real?';
  this.callback = function (session, input) {
    if (input === '') {
      var output = 'There is help for the following commands:\n\n';
      var keys = Object.keys(Commands.commands);

      for (var i = 0; i < keys.length; ++i) {
        command = Commands.commands[keys[i]];
        // If character does not have access to a command it should be
        // omitted from help output.
        if (typeof command.permsRequired !== 'undefined') {
          if (session.character.perms.includes(command.permsRequired) === false) {
            continue;
          }
        }
        if (command.helpText !== '') {
          output += command.trigger.toUpperCase() + '\n';
        }
      }
      session.write(output);
      return;
    }
    if (typeof Commands.commands[input] !== 'undefined') {
      var command = Commands.commands[input];
      // If character does not have access to a command it should be
      // omitted from help output.
      if (typeof command.permsRequired !== 'undefined') {
        if (session.character.perms.includes(command.permsRequired) === false) {
          session.write('There is no help for that term.');
          return false;
        }
      }
      // Valid commands may have their help text intentionally blanked
      if (command.helpText !== '') {
        var helpText = '%cyan%Help topic [' + input + ']%cyan%\n';
        helpText += command.helpText;
        session.write(Tokens.replace(helpText, {character:session.character}));
      }
      else {
        session.write('There is no help for that term.');
        return false;
      }
    }
    else {
      session.write('There is no help for that term.');
      return false;
    }
  }
}

module.exports = new Command();
