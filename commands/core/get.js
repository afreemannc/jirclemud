var Command = function() {
  this.trigger = 'get';
  this.helpText = `
  Get an item from the room or a container.

  %yellow%Usage:%yellow%
         get <thing>
         get <thing> from <container>

  %yellow%Example:%yellow%
         > look
         >
         > %bold%Someone has left a battered old hat lying here.%bold%
         >
         > get hat
         >
         > %bold%You pick up a battered old hat%bold%

  `;
  this.callback = function(session, input) {
    if (input === 'ye flask') {
      session.write(global.colors.bold('Ye cannot get ye flask.');
      return true;
    }
    var roomId = session.character.currentRoom;
    var name = session.character.name;
    var index = global.containers.findItemInContainer(input, 'name', global.rooms.room[roomId].inventory, true);
    if (index !== false) {
      var transferDetails = {
        transferType: 'room-to-character',
        item: global.rooms.room[roomId].inventory[index],
        index: index
      }
      global.containers.transferItemInstance(session, transferDetails);
      // player message
      session.write('You pick up a ' + fieldValues.item.name);
      // room message
      global.rooms.message(session, roomId, name + ' picks up a ' + fieldValues.item.name, true);
    }
    else {
      session.error('Get what??\n');
    }
  }
}

module.exports = new Command();
