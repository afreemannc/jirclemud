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
    var roomId = session.character.currentRoom;
    var characterId = session.character.id;
    var currentExits = global.rooms.room[roomId].exits;

    if (typeof currentExits[input] === 'undefined') {
      session.error('Alas, you cannot go that way.');
    }
    else {
      var currentExit = currentExits[input];
      session.character.currentRoom = currentExit.target_rid;
      global.commands.triggers.look(session, '');
    }
  }
}

module.exports = new Command();
