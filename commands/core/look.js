var Command = function() {
  this.trigger = 'look';
  this.helpText = '';
  this.synonyms = ['examine'];
  this.callback = function (socket, input) {
    // Room look, aka look with no additional arguments passed.
    if (input === '') {
      var roomId = socket.playerSession.character.currentRoom;
      console.log('exits:');
      console.log(global.rooms.room[roomId].exits);
      // display room title
      socket.write(global.colors.bold(global.tokens.replace(socket, global.rooms.room[roomId].name)) + "\n");
      // display room description
      socket.write(global.tokens.replace(socket, global.rooms.room[roomId].full_description) + "\n\n");
      // display room inventory
      var display = global.items.inventoryDisplay(socket, global.rooms.room[roomId].inventory);
      socket.write(global.tokens.replace(socket, display) + "\n\n");
      // display exits
      var exits = global.rooms.room[roomId].exits;
      exitKeys = Object.keys(exits);
      if (exitKeys.length > 0) {
        socket.playerSession.write('Exits: [ ' + exitKeys.join(' ') + ' ]\n');
      }
      else {
        socket.playerSession.write('Exits: [none]\n');
      }
    }
    else {
      // Check personal inventory
      var itemIndex = global.items.searchInventory(input, 'name', socket.playerSession.character.inventory, true);
      if (itemIndex !== false) {
        console.log(socket.playerSession.character.inventory[itemIndex]);
      }
    }
  }

}

module.exports = new Command();
