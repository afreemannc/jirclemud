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
      }
      else {
        // Check the room for items
        itemIndex = Containers.findItemInContainer(input, 'name', room.inventory, true);
        if (itemIndex !== false) {
          session.write(room.inventory[itemIndex].full_description);
        }
        else {
          // check the room for mobs
          itemIndex = Containers.findItemInContainer(input, 'name', room.mobiles, true);
          if (itemIndex !== false) {
            session.write(JSON.stringify(room.mobiles[itemIndex]));
          }
          else {
            session.error('You do not see one of those here.');
          }
        }
      }
    }
  }
}

module.exports = new Command();
