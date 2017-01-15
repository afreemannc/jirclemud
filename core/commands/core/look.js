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
      var current_room = Rooms.room[roomId];
      // display room title
      if (session.character.stats.flags.includes('BUILDER')) {
        session.socket.write("\n" + Tokens.replace('%bold%%room.name%%bold% %green%[%room.rid%]%green%', {room:current_room})+ "\n");
      }
      else {
        session.socket.write(Tokens.replace('%bold%%room.name%%bold%', {room:current_room})+ "\n");
      }
      // display room description
      session.socket.write(Tokens.replace('%room.description%', {room:current_room}) + "\n");
      // display exits
      var exits = Rooms.room[roomId].exits;
      var exitKeys = Object.keys(exits);
      var standardExits = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw', 'u', 'd'];
      if (exitKeys.length > 0) {
        var exitDisplay = []
        for (i = 0; i < standardExits.length; ++i) {
          if (exitKeys.indexOf(standardExits[i]) !== -1) {
            // Skip closed doors.
            console.log('checking exit:');
            console.log(exits[standardExits[i]]);
            if (typeof exits[standardExits[i]].properties.flags !== 'undefined') {
              if (exits[standardExits[i]].properties.flags.includes('CLOSED')) {
                console.log('closed door found ' + standardExits[i]);
                continue;
              }
            }
            exitDisplay.push(standardExits[i]);
          }
        }
        session.socket.write('Exits: [ ' + Tokens.replace('%yellow%' + exitDisplay.join(' ') + '%yellow%') + ' ]\n\n');
      }
      else {
        session.socket.write('Exits: [none]\n\n');
      }
      // display room inventory
      if (current_room.inventory.length > 0) {
        var display = Items.inventoryDisplay(curent_room.inventory, true);
        session.socket.write(Tokens.replace(display) + "\n");
      }
      // display mobiles

      if (current_room.mobiles.length > 0) {
        current_room.mobiles.forEach(function(mobile) {
          if (session.character.stats.flags.includes('BUILDER')) {
            session.socket.write(Tokens.replace('%mobile.name%%yellow%[%mobile.miid%]%yellow%\n', {mobile:mobile}));
          }
          else {
            session.socket.write(Tokens.replace(mobile.name) + '\n');
          }
        });
      }
      session.write('');
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
