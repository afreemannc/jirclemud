var Command = function() {
  this.trigger = 'scan';
  this.helpText = `
  Check your surroundings for mobs.

  %yellow%Usage:%yellow%
         scan

  %yellow%Usage:%yellow%
         > scan
         >
         > %bold%Immediate area: A small chipmunk.%bold%
         > %bold%East: a gray squirrel.%bold%
         > %bold%South: a gray squirrel.%bold%
         > %bold%South: a fawn.%bold%
         > %bold%Far south: an elven ranger.%bold%

  `;
  this.callback = function (session, input) {
    // TODO: refactor this mess.
    // Immediate area
    var message = '';
    var roomId = session.character.current_room;
    var mobiles = Rooms.room[roomId].mobiles;
    if (mobiles.length > 0) {
      for (var i = 0; i < mobiles.length; ++i) {
        message += 'Immediate area: ' + mobiles[i].short_name + '\n';
      }
    }
    // get room exits
    var exitLabels = Object.keys(Rooms.room[roomId].exits);

    for (var i = 0; i < exitLabels.length; ++i) {
      var exitLabel = exitLabels[i];
      var exit = Rooms.room[roomId].exits[exitLabel];
      if (exit.properties.flags.includes('CLOSED') === false) {
        // check adjoining rooms
        var mobiles = Rooms.room[exit.target_rid].mobiles;
        if (mobiles.length > 0) {
          var exitLabelLong = Rooms.exitLabelToLong(exitLabel);
          for (var j = 0; j < mobiles.length; ++j) {
            if (exitLabelLong !== false) {
              message += exitLabelLong + ': ' + mobiles[j].name + '\n';
            }
            else {
              message += exitLabel + ': ' + mobiles[j].name + '\n';
            }
          }
        }
        // Check secondary rooms

      }
    }
    session.write(message);
  }
}

module.exports = new Command();
