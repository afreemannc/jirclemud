var Command = function() {
  this.trigger = 'open';
  this.helpText = `
  Open something that is closed.

  %yellow%Usage:%yellow%
         Open a door: open <direction>
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
    if (Rooms.inputIsExit(session, input) {
      var roomId = session.character.current_room;
      var exits = Rooms[roomId].exits;

      if (exits[input].properties.flags.includes('LOCKED')) {
        session.write('The door will not open. It appears to be locked.');
        return false;
      }

      if (exits[input].properties.flags.includes('CLOSED')) {
        var index = exits[input].properties.flags.indexOf('CLOSED');
        Rooms.room[roomId].exits[input].properties.flags.splice(index, 1);
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
    }
  }
}

module.exports = new Command();
