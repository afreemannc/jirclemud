var Command = function() {
  this.trigger = 'remove';
  this.helpText = `
  Remove an item you are wearing.

  %yellow%Usage:%yellow%
         remove <item>

  %yellow%Example:%yellow%
         > remove codpiece
         >
         > %bold%You take off a colorful codpiece.%bold%
         >
         > %bold% Dent says 'OMG MY EYES MAKE IT STOP'%bold%
  `;
  this.callback = function(session, input) {
    var index = global.containers.findItemInContainer(input, 'name', session.character.equipment, true);
    if (index !== false) {
      var transferDetails = {
        transferType: 'equipped-to-character',
        item: session.character.equipment[index],
        index: index
      }
      global.containers.transferItemInstance(session, transferDetails);
      var roomId = session.character.currentRoom;
      var name = session.character.name;
      // player message
      session.write('You take off ' + transferDetails.item.name);
      // room message
      global.rooms.message(session, roomId, name + ' takes off ' + transferDetails.item.name, true);
    }
    else {
      session.error('Remove what??\n');
    }
  }

}

module.exports = new Command();
