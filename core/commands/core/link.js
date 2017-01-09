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
      var currentRoom = Rooms.room[roomId];
      var exitLabel = inputParts[0];
      var targetRid = inputParts[1];
    }
    // link direction already occupied with an exit
    if (typeof currentRoom.exits[exitLabel] !== 'undefined') {
      session.error('There is already an exit in that direction.');
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
      description: 'Nothing to see here.',
      properties: JSON.stringify({})
    }
    var RoomExit = Models.RoomExit;
    RoomExit.create(values).then(function(exitInstance) {
      session.write("New exit created.");
      Rooms.room[roomId].exits[exitLabel] = exitInstance.dataValues;
    });
  }
}

module.exports = new Command();
