var Command = function() {
  this.trigger = 'bamf';
  this.helpText = 'Immortals only: instantly change rooms.';
  this.callback = function(socket, input) {
    // TODO: confirm current user has GOD or DEMI flag
    if (input.length === 0 || typeof global.rooms.room[input] === 'undefined') {
      socket.playerSession.error("Teleport where??\n");
    }
    else {
      var exitMessage = 'Bamf!';
      socket.playerSession.character.currentRoom = input;
      global.commands.triggers.look(socket, '');
    }
  }

}

module.exports = new Command();
