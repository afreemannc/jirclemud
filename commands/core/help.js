var Command = function() {
  this.trigger = 'help';
  this.helpText = 'Are you for real?';
  this.callback = function (socket, input) {
    if (typeof global.commands.commands[input] !== 'undefined') {
      var helpText = global.commands.commands[input].helpText;
      socket.playerSession.write(helpText);
    }
    else {
      socket.playerSession.write('There is no help for that term.');
    }
  }

}

module.exports = new Command();
