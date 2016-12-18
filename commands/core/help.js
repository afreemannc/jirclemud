var Command = function() {
  this.trigger = 'help';
  this.helpText = 'Are you for real?';
  this.callback = function (socket, input) {
    if (typeof global.commands.commands[input] !== 'undefined') {
      var helpText = global.commands.commands[input].helpText;
      socket.playersession.write(helpText);
    }
  }

}

module.exports = new Command();
