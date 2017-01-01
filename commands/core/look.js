var Command = function() {
  this.trigger = 'look';
  this.helpText = '';
  this.synonyms = ['examine'];
  this.callback = function (session, input) {
    // Room look, aka look with no additional arguments passed.
    if (input === '') {
      var roomId = session.character.currentRoom;
      console.log('exits:');
      console.log(global.rooms.room[roomId].exits);
      // display room title
      session.socket.write(global.colors.bold(global.tokens.replace(session, global.rooms.room[roomId].name)) + "\n");
      // display room description
      session.socket.write(global.tokens.replace(session, global.rooms.room[roomId].full_description) + "\n\n");
      // display room inventory
      var display = global.items.inventoryDisplay(global.rooms.room[roomId].inventory);
      session.socket.write(global.tokens.replace(session, display) + "\n\n");
      // display exits
      var exits = global.rooms.room[roomId].exits;
      exitKeys = Object.keys(exits);
      if (exitKeys.length > 0) {
        session.write('Exits: [ ' + global.colors.yellow(exitKeys.join(' ')) + ' ]\n');
      }
      else {
        session.write('Exits: [none]\n');
      }
    }
    else {
      // Check personal inventory
      var itemIndex = global.items.searchInventory(input, 'name', session.character.inventory, true);
      if (itemIndex !== false) {
        console.log(session.character.inventory[itemIndex]);
      }
    }
  }
}

module.exports = new Command();
