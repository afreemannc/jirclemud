var Command = function() {
  this.trigger = 'bamf';
  this.permsRequired = 'ADMIN';
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
    if (input.length === 0 || typeof Rooms.room[input] === 'undefined') {
      session.error("Bamf where??\n");
    }
    else {
      Rooms.message(session, session.character.current_room, "BAMF!\n" + session.character.name + ' disappears with a bang.', true);
      session.character.current_room = input;
      Rooms.message(session, input, session.character.name + ' appears in a cloud of brimstone.', true);
      Commands.triggers.look(session, '');
    }
  }

}

module.exports = new Command();
