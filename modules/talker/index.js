function Module() {
  this.name = 'Talker';
  this.description = 'Add talker items to your world setting.'
  this.features = ['commands', 'itemflags'];

  this.install = false;
  // Whenever this module is loaded the TALKER flag is added as an option during item creation.
  this.load = function() {
    console.log('talker module load invoked');
    Items.flags['talker'] = "TALKER";
    Items.event.on('itemMove', function(session, item, moveType) {
      // Character is getting rid of an item or stashing it in a container.
      if (moveType.includes('character-to') && moveType.includes('equipped') === false) {
        // A talker is moving, check to see if we need to do stuff with character perms.
        if (item.properties.flags.includes('TALKER')) {
          for (var i = 0; i < session.character.inventory.length; ++i) {
            var invItem = session.character.inventory[i];
            if (invItem.properties.flags.includes('TALKER') && invItem.instance_id !== item.instance_id) {
              // character has another talker on them, nothing to do here.
              return true;
            }
          }
          // Looks like the character got rid of their only talker, strip talker perm.
          var index = session.character.perms.indexOf('HASTALKER');
          if (index) {
            session.character.perms.splice(index, 1);
          }
        }
      }
      else if (moveType.includes('to-character')) {
        // Character is getting a new item
        if (item.properties.flags.includes('TALKER')) {
          var index = session.character.perms.indexOf('HASTALKER');
          if (index === false) {
            // The new item is a talker, they don't already have one, grant talker perm.
            session.charactr.perms.push('HASTALKER');
          }
        }
      }
    });
  }

  // End of boilerplate. Now we start writing part of this thing that actually does stuff.
  this.write = function(session, message, channel) {
    for (var i = 0; i < Sessions.length; ++i) {
      console.log('talker channel:' + Sessions[i].talkerChannel);
      console.log('searching for channel:' + channel);
      if (Sessions[i].talkerChannel === channel) {
        Sessions[i].write('[' + channel + '] ' + session.character.name + ': ' + message);
        return true;
      }
    }
  }
}

module.exports = new Module();
