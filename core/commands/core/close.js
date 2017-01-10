var Command = function() {
  this.trigger = 'close';
  this.helpText = `
  Close something that is open.

  %yellow%Usage:%yellow%
         Close a door: close <direction>
         Close an open object: close <item name>

  %yellow%Usage:%yellow%
         > close e
         >
         > %bold%You close the door.%bold%
         >
         > close chest
         >
         > %bold%You close the chest..%bold%
  `;
  this.callback = function (session, input) {
    if (Rooms.inputIsExit(session, input)) {
      var inputInverted = Rooms.invertExitLabel(input);
      var roomId = session.character.current_room;
      var exit = Rooms.room[roomId].exits[input];
      if (exit.properties.flags.includes('DOOR') === false) {
        session.write('There is no door there.');
        return false;
      }

      if (exit.properties.flags.includes('CLOSED')) {
        session.write('It is already closed!');
        return false;
      }
      else {
        Rooms.room[roomId].exits[input].properties.flags.push('CLOSED');
        Rooms.room[exit.target_rid].exits[inputInverted].properties.flags.push('CLOSED');
        session.write("You close the door.");
        return true;
      }
    }
    else {
      // TODO: implement item close once CLOSEABLE and CLOSED flags are implemented for items.
    }
  }
}

module.exports = new Command();
