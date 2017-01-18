var Command = function() {
  this.trigger = 'wear';
  this.helpText = `
  Equip an item you are carrying.

  %yellow%Usage:%yellow%
         equip <item>

  %yellow%Example:%yellow%
         > wear codpiece
         >
         > %bold%You wear a colorful codpiece around your waist.%bold%
  `;
  this.callback = function(session, input) {
    var index = Items.findItemInContainer(input, 'name', session.character.inventory, true);
    if (index !== false) {
      var item = session.character.inventory[index];
      if (item.properties.flags.includes('WEARABLE') === false) {
        session.write('You cannot wear that.');
        return false;
      }

      // TODO: check for wearable flag first.
      var transferDetails = {
        transferType: 'character-to-equipped',
        item: session.character.inventory[index],
        index: index
      }
      Items.transferItemInstance(session, transferDetails);
      var roomId = session.character.current_room;
      var name = session.character.name;
      // player message
      //TODO: write a thing to determine if a or an is appropriate.
      session.write('You wear ' + transferDetails.item.name);
      // room message
      Rooms.message(session, roomId, name + ' wears ' + transferDetails.item.name, true);
    }
    else {
      session.error('Wear what??\n');
    }
  }

}

module.exports = new Command();
