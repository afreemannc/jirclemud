var Command = function() {
  this.trigger = 'gossip';
  this.helpText = '';
  this.callback = function (socket, input) {
    var message = global.colors.magenta("[gossip] " + socket.playerSession.character.name + ": " + input + "\n");
    global.rooms.message(socket, false, message, false);
  }

}

module.exports = new Command();
