var Command = function() {
  this.trigger = 'quit';
  this.helpText = '';
  this.callback = function (session, input) {
    var quitMessage = global.config.quitMessage;
    session.socket.end(quitMessage);
  }

}

module.exports = new Command();
