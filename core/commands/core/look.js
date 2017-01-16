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
      Rooms.displayRoom(session, roomId);
    }
    else {
      var roomId = session.character.current_room;
      var room = Rooms.room[roomId];
      // Check personal inventory
      var itemIndex = Containers.findItemInContainer(input, 'name', session.character.inventory, true);
      if (itemIndex !== false) {
        session.write(session.character.inventory[itemIndex].full_description);
        return true;
      }

      // Check the room for items
      var itemIndex = Containers.findItemInContainer(input, 'name', room.inventory, true);
      if (itemIndex !== false) {
        session.write(room.inventory[itemIndex].full_description);
        return true;
      }

      // check the room for mobs
      var itemIndex = Containers.findItemInContainer(input, 'name', room.mobiles, true);
      if (itemIndex !== false) {
        Mobiles.displayMobile(session, room.mobiles[itemIndex]);
        return true;
      }

      // TODO: character look.

      session.error('You do not see one of those here.');
      return false;

    }
  }
}

module.exports = new Command();
