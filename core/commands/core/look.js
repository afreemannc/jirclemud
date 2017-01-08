var Command = function() {
  this.trigger = 'look';
  this.helpText = `
  Look at things in your surroundings.

  %yellow%Usage:%yellow%
         look (displays current room)
         look <item> (displays item description)
         look <character> (displays character description and worn equipment)

  %yellow%Example:%yellow%
         > look waterskin
         >
         > %bold% This is a well worn waterskin. It is currently half full and contains water.%bold%
  `;
  this.synonyms = ['examine'];
  this.callback = function (session, input) {
    // Room look, aka look with no additional arguments passed.
    if (input === '') {
      var roomId = session.character.current_room;
      var room = Rooms.room[roomId];
      // display room title
      session.socket.write(Tokens.replace(session, '%bold%' + room.name + '%bold%')+ "\n");
      // display room description
      session.socket.write(Tokens.replace(session, room.description) + "\n\n");
      // display room inventory
      if (room.inventory.length > 0) {
        var display = Items.inventoryDisplay(Rooms.room[roomId].inventory);
        session.socket.write(Tokens.replace(session, display) + "\n\n");
      }
      // display exits
      console.log(Rooms.room[roomId]);
      var exits = Rooms.room[roomId].exits;
      exitKeys = Object.keys(exits);
      if (exitKeys.length > 0) {
        session.write('Exits: [ ' + Tokens.replace(session, '%yellow%' + exitKeys.join(' ') + '%yellow%') + ' ]\n');
      }
      else {
        session.write('Exits: [none]\n');
      }
    }
    else {
      var roomId = session.character.current_room;
      var room = Rooms.room[roomId];
      // Check personal inventory
      var itemIndex = Containers.findItemInContainer(input, 'name', session.character.inventory, true);
      if (itemIndex !== false) {
        session.write(session.character.inventory[itemIndex].full_description);
      }
      else {
        // Check the room
        itemIndex = Containers.findItemInContainer(input, 'name', room.inventory, true);
        if (itemIndex !== false) {
          session.write(room.inventory[itemIndex].full_description);
        }
        else {
          session.error('You do not see one of those here.');
        }
      }
    }
  }
}

module.exports = new Command();
