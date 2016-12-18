var Command = function() {
  this.trigger = 'bamf';
  this.helpText = 'Immortals only: instantly change rooms.';
  this.callback = function(socket, input) {
    // TODO: confirm current user has GOD or DEMI flag
    if (input.length === 0) {
      socket.playerSession.error("Teleport where??\n");
    }
    else {
      var exitMessage = 'Bamf!';
      global.rooms.loadRoom(socket, input, exitMessage);
    }
  }

}

module.exports = new Command();
