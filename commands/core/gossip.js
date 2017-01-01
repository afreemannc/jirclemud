var Command = function() {
  this.trigger = 'gossip';
  this.helpText = '';
  this.callback = function (session, input) {
    var message = global.colors.magenta("[gossip] " + session.character.name + ": " + input + "\n");
    global.rooms.message(session, false, message, false);
  }

}

module.exports = new Command();
