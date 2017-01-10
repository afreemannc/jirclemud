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
    if (Rooms.inputIsExit(session, input) {
      var roomId = session.character.current_room;
      var exits = Rooms[roomId].exits;


      if (exits[input].properties.flags.includes('CLOSED') {
        session.write('It is already closed!');
        return false;
      }
      else {
        Rooms.room[roomId].exits[input].properties.flags.push('CLOSED');
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
