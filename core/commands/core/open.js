var Command = function() {
  this.trigger = 'open';
  this.helpText = `
  Open something that is closed.

  %yellow%Usage:%yellow%
         Open a door: open <direction>
         Open a door: open door <direction>
         Open a closed object: open <item name>

  %yellow%Usage:%yellow%
         > open e
         >
         > %bold%You open the east door.%bold%
         >
         > open chest
         >
         > %bold%The chest will not open. It appears to be locked.%bold%
  `;
  this.callback = function (session, input) {
    if (input.includes('door')) {
      var inputParts = input.split(' ');
      input = inputParts[1];
    }


    if (Rooms.inputIsExit(session, input)) {
      var inputInverted = Rooms.invertExitLabel(input);
      var roomId = session.character.current_room;
      var exit = Rooms.room[roomId].exits[input];
      var recipExit = Rooms.room[exit.target_rid].exits[inputInverted];

      if (exit.properties.flags.includes('DOOR') === false) {
        session.write('There is no door there.');
        return false;
      }

      if (exit.properties.flags.includes('LOCKED')) {
        session.write('The door will not open. It appears to be locked.');
        return false;
      }

      if (exit.properties.flags.includes('CLOSED')) {
        var index = exit.properties.flags.indexOf('CLOSED');
        Rooms.room[roomId].exits[input].properties.flags.splice(index, 1);
        index = recipExit.properties.flags.indexOf('CLOSED');
        Rooms.room[exit.target_rid].exits[inputInverted].properties.flags.splice(index, 1);
        session.write('You open the door.');
        return true;
      }
      else {
        session.write("It isn't even closed!");
        return false;
      }
    }
    else {
      // TODO: implement item open once CLOSEABLE and CLOSED flags are implemented for items.
      session.write('Open what?');
      return false;
    }
  }
}

module.exports = new Command();
