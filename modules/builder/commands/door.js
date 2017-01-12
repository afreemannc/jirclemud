var Command = function() {
  this.trigger = 'door';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Create a door leading from current room to another room.
  Note: this command will attempt to create reciprocal exits in both rooms if possible.

  %yellow%Usage:%yellow%
         Create an unlocked door: door <direction> <target room id>
         Create a locked door: door <direction> <target room id> locked

  %yellow%Example:%yellow%
         > door e 110
         >
         > %bold%Door saved.%bold%
         >
         > look
         >
         > %bold%Exits: [ e ]%bold%

  `;
  this.callback = function (session, input) {
    var inputParts = input.split(' ');

    // missing input
    if (inputParts.length < 2) {
      session.error('You want a door what??');
      return false;
    }
    else {
      var roomId = session.character.current_room;
      var currentRoom = Rooms.room[roomId];
      var exitLabel = inputParts[0];
      var targetRid = inputParts[1];
      if (typeof inputParts[3] !== 'undefined') {
        if (inputParts[3] === 'locked') {
          var locked = true;
        }
        else {
          session.error('What do you mean by ' + inputParts[3] + '?');
          return false;
        }
      }
      else {
        var locked = false;
      }
    }
    // door direction already occupied with an exit
    if (typeof currentRoom.exits[exitLabel] !== 'undefined') {
      session.error('There is already an exit here in that direction. Unlink the offending exit and try again.');
      return false;
    }

    // link attempt to a nonexistent room id
    if (typeof Rooms.room[targetRid] === 'undefined') {
      session.error('Room ' + targetRid + ' does not exist.');
      return false;
    }

    var labelInverted = Rooms.invertExitLabel(exitLabel);
    if (typeof Rooms.room[targetRid].exits[exitLabel] !== 'undefined') {
      session.error('The room you are trying to door to already has a ' + labelInverted + ' exit. Unlink the offending exit and try again.');
      return false;
    }
    var doorFlags = ['DOOR', 'CLOSED'];
    if (locked === true) {
      doorFlags.push('LOCKABLE');
      doorFlags.push('LOCKED');
    }

    var values = {
      rid: session.character.current_room,
      target_rid: targetRid,
      label: exitLabel,
      description: 'Nothing to see here.',
      properties: JSON.stringify({flags:doorFlags})
    }
    var RoomExit = Models.RoomExit;
    RoomExit.create(values).then(function(exitInstance) {
      session.write("New exit created.");
      Rooms.room[roomId].exits[exitLabel] = exitInstance.dataValues;
      var values = {
        rid: targetRid,
        label: labelInverted,
        description: 'Nothing to see here.',
        properties: JSON.stringify({flags: doorFlags})
      }
      RoomExit.create(values).then(function(recipExitInstance) {
        session.write("Reciprocal exit created.");
        Rooms.room[targetRid].exits[labelInverted] = recipExitInstance.dataValues;
      });
    });
  }
}

module.exports = new Command();
