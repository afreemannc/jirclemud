var Command = function() {
  this.trigger = 'bamf';
  this.helpText = 'Immortals only: instantly change rooms.';
  this.callback = function(session, input) {
    // TODO: confirm current user has GOD or DEMI flag
    if (input.length === 0 || typeof global.rooms.room[input] === 'undefined') {
      session.error("Bamf where??\n");
    }
    else {
      var exitMessage = 'Bamf!';
      session.character.currentRoom = input;
      global.commands.triggers.look(session, '');
    }
  }

}

module.exports = new Command();
