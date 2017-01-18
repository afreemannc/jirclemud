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
      session.write(Tokens.replace('%bold%Ye cannot get ye flask.%bold%'));
      return true;
    }
    var roomId = session.character.current_room;
    var name = session.character.name;
    var index = Items.findItemInContainer(input, 'name', Rooms.room[roomId].inventory, true);
    if (index !== false) {
      var transferDetails = {
        transferType: 'room-to-character',
        item: Rooms.room[roomId].inventory[index],
        index: index
      }
      Items.transferItemInstance(session, transferDetails);
      // player message
      session.write('You pick up a ' + transferDetails.item.name);
      // room message
      Rooms.message(session, roomId, name + ' picks up a ' + transferDetails.item.name, true);
    }
    else {
      session.error('Get what??\n');
    }
  }
}

module.exports = new Command();
