var Command = function() {
  this.trigger = 'wield';
  this.helpText = `
  Wield an item you are carrying.

  %yellow%Usage:%yellow%
         wield <item>

  %yellow%Example:%yellow%
         > wield axe
         >
         > %bold%You wield a dwarven war axe.%bold%
  `;
  this.callback = function(session, input) {
    var index = Containers.findItemInContainer(input, 'name', session.character.inventory, true);
    if (index !== false) {
      var item = session.character.inventory[index];
      if (item.properties.flags.includes('WIELD') === false) {
        session.write('You cannot wield that.');
        return false;
      }
      var transferDetails = {
        transferType: 'character-to-equipped',
        item: session.character.inventory[index],
        index: index,
      }
      Containers.transferItemInstance(session, transferDetails);
      var roomId = session.character.current_room;
      var name = session.character.name;
      // player message
      //TODO: write a thing to determine if a or an is appropriate.
      session.write('You wield ' + transferDetails.item.name);
      // room message
      Rooms.message(session, roomId, name + ' wields ' + transferDetails.item.name, true);
    }
    else {
      session.error('Wield what??\n');
    }
  }

}

module.exports = new Command();
