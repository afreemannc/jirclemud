var Command = function() {
  this.trigger = 'exits';
  this.helpText = `
  This command shows you a list of obvious exits from your location. Note less obvious ones will not show up here.

  %yellow%Usage:%yellow%
         exits

  %yellow%Usage:%yellow%
         > exits
         >
         > %bold%Obvious exits:%bold%
         > %bold%North - The basement%bold%
         > %bold%East - DOOR%bold%
  `;
  this.callback = function (session, input) {
    var message = 'Obvious exits:\n';
    var roomId = session.character.current_room;
    var exits = Rooms.room[roomId].exits;
    var exitKeys = Object.keys(exits);

    var replacements = {
      n: 'North',
      ne: 'Northeast',
      e: 'East',
      se: 'Southeast',
      s: 'South',
      sw: 'Southwest',
      w: 'West',
      nw: 'Northwest',
      u: 'Up',
      d: 'Down',
    }

    for (i = 0; i < exitKeys.length; ++i) {
      var label = exitKeys[i];
      var exit = exits[label];

      if (typeof replacements[label] !== 'undefined') {
        label = replacements[label];
      }
      var roomName = Rooms.room[exit.target_rid].name;

      if (typeof exit.properties.flags !== 'undefined') {
        if (exit.properties.flags.includes('CLOSED')) {
          var roomName = 'DOOR';
        }
        else {
          var roomName = Rooms.room[exit.target_rid].name;
        }
      }
      message += label + ' - ' + roomName + '\n';
    };

    session.write(message);
  }

}

module.exports = new Command();
