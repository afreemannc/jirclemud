var Command = function() {
  this.trigger = 'unlink';
  this.helpText = `
  Destroy an exit leading from the current room to another room.
  Note: this command only destroys a single exit pointing to the target room.

  %yellow%Usage:%yellow%
         unlink <direction>

  %yellow%Example:%yellow%
         > look
         >
         > %bold%Exits: [ e w ]%bold%
         >
         > unlink e
         >
         > %bold%Exit removed.%bold%
         >
         > look
         >
         > %bold%Exits: [ w ]%bold%

  `;
  this.callback = function (session, input) {
    var inputParts = input.split(' ');

    // missing input
    if (inputParts.length < 1) {
      session.error('Unlink what??');
      return false;
    }
    else {
      var roomId = session.character.current_room;
      var currentRoom = Rooms.room[roomId];
      var exitLabel = inputParts[0];
    }
    // link direction already occupied with an exit
    if (typeof currentRoom.exits[exitLabel] === 'undefined') {
      session.error('There is no exit in that direction.');
      return false;
    }
     var targetExit = Rooms.room[roomId].exits[exitLabel];

    var RoomExit = Models.RoomExit;
    RoomExit.destroy({where:{eid: targetExit.eid}}).then(function() {
      session.write("Exit destroyed.");
      delete Rooms.room[roomId].exits[exitLabel];
    });
  }
}

module.exports = new Command();
