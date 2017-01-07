var Command = function() {
  this.trigger = 'link';
  this.helpText = `
  Create an exit leading from the current room to another room.
  Note: this command only creates a single exit pointing to the target room.
  This is vital when creating maze walks and the like.

  %yellow%Usage:%yellow%
         link <direction> <target room id>

  %yellow%Example:%yellow%
         > link e 110
         >
         > %bold%Exit saved.%bold%
         >
         > look
         >
         > %bold%Exits: [ e ]%bold%

  `;
  this.callback = function (session, input) {
    var inputParts = input.split(' ');

    // missing input
    if (inputParts.length < 2) {
      session.error('Link what??');
      return false;
    }
    else {
      var roomId = session.character.current_room;
      var current_room = Rooms.room[roomId];
      var exitLabel = inputParts[0];
      var targetRid = inputParts[1];
    }
    // link direction already occupied with an exit
    var currentExit = false;
    for (var i = 0; i < current_room.exits.length; ++i) {
      currentExit = current_room.exits[i];
      if (currentExit.label === exitLabel) {
        session.error('There is already an exit in that direction.');
        return false;
      }
    }
    // target rid is not a number;
    if (Number.isInteger(targetRid) === false) {
      session.error('Target room id specified is incorrect. The room id must be a number.');
      return false;
    }

    // link attempt to a nonexistent room id
    if (typeof Rooms.room[targetRid] === 'undefined') {
      session.error('Room ' + targetRid + ' does not exist.');
      return false;
    }

    var values = {
      rid: session.character.current_room,
      target_rid: targetRid,
      label: exitLabel,
      description: '',
    }
  }
}

module.exports = new Command();
