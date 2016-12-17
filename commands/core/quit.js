var Command = function() {
  this.trigger = 'quit';
  this.helpText = '';
  this.callback = function (socket, input) {
    var quitMessage = global.config.quitMessage;
    socket.end(quitMessage);
  }

}

module.exports = new Command();
