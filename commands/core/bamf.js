var Command = function() {
  this.trigger = 'bamf';
  this.helpText = `
  One of the priviledges of being an admin is the ability to instantly move from any room to any other room.

  %yellow%Usage:%yellow%
         bamf <room number>

  %yellow%Example:%yellow%
         > %red%Dent tells you 'Derp has been insulting me over tell for no reason.'%red%
         >
         > where Derp
         >
         > %bold%Derp: - The Red Stag Inn [115]%bold%
         >
         > bamf 115
         >
         > %bold% The Red Stag Inn [115]%bold%
         > Derp is standing here.
  `;
  this.callback = function(session, input) {
    // TODO: confirm current user has GOD or DEMI flag
    if (input.length === 0 || typeof global.rooms.room[input] === 'undefined') {
      session.error("Bamf where??\n");
    }
    else {
      var exitMessage = 'Bamf!';
      session.character.currentRoom = input;
      global.commands.triggers.look(session, '');
    }
  }

}

module.exports = new Command();
