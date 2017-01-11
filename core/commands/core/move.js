var Command = function() {
  this.trigger = 'move';
  this.helpText = `
  Move your character from room to room. Unlike most other commands the command name
  may be omitted when moving by just typing the direction you want to move.

  %yellow%Usage:%yellow%
         move <direction>
         <direction>

  %yellow%Example:%yellow%

    > move e
    > You travel east.
    >
    > w
    > You travel west.
  `;
  this.callback = function (session, input) {
    var roomId = session.character.current_room;
    var characterId = session.character.id;
    var currentExits = Rooms.room[roomId].exits;

    if (typeof currentExits[input] === 'undefined') {
      session.error('Alas, you cannot go that way.');
    }
    else {
      var currentExit = currentExits[input];
      if (currentExit.properties.flags.includes('CLOSED')) {
        session.write('The door seems to be closed.');
        return false;
      }
      else {
        session.character.current_room = currentExit.target_rid;
        Rooms.message(session, roomId, session.character.name + ' leaves.', true);
        Rooms.message(session, currentExit.target_rid, session.character.name + ' arrives.', true);
        Commands.triggers.look(session, '');
      }
    }
  }
}

module.exports = new Command();
