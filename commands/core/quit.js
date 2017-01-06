var Command = function() {
  this.trigger = 'quit';
  this.helpText = `
  Quit your game session and disconnect.

  %yellow%Usage:%yellow%
         quit

  %yellow%Usage:%yellow%
         > quit
         >
         > %bold%Goodbye!%bold%
         > Connection closed by foreign host.
  `;
  this.callback = function (session, input) {
    var quitMessage = Config.quitMessage;
    session.socket.end(quitMessage);
  }

}

module.exports = new Command();
