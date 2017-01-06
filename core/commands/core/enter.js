var Command = function() {
  this.trigger = 'enter';
  this.helpText = `
  Some powerful items are portals to another place. The enter command lets you use this type of item to travel to
  the portal destination. Warning! Some portal destinations may be hazardous to your health.

  %yellow%Usage:%yellow%
         enter <portal name>

  %yellow%Example:%yellow%
         > %bold%A henge of carved stones stands here.%bold%
         >
         > enter henge
         >
         > %bold%You step into the henge and are instantly transported elsewhere!%bold%
         >
         > %bold%The 7th circle of hell%bold%
         > %bold%RIP. You are overcome by the searing heat. You have died.%bold%
         >
         > %yellow%Mourn: Derp has been killed by a boiling river of blood and fire%yellow%
         >
         > %magenta%Dent gossips: LOL RIP%magenta%

  `;
  this.callback = function (session, input) {
    var roomId = session.character.currentRoom;
    var name = session.character.name;
    var itemIndex = Containers.findItemInContainer(input, 'name', global.rooms.room[roomId].inventory, true);
    if (itemIndex === false) {
      session.error('There is nothing like that here for you to enter.');
    }
    else {
      var portal = global.rooms.room[roomId].inventory[itemIndex];
      if (portal.properties.flags.includes('PORTAL') === false) {
        session.error('Enter what?');
      }
      else {
        var target_rid = portal.properties.target_rid;
        if (typeof global.rooms.room[target_rid] === undefined) {
          // someone derped the target id so throw an innoccuous error for the user.
          session.error('You try to enter but cannot fit into the opening.');
          console.log('ERROR: Portal item ' + portal.instance_id + ' is broken. Check the target room id on this item.');
          return false;
        }
        else {
          session.character.currentRoom = target_rid;
          session.socket.write('You step into the ' + portal.name + ' and disappear.');
          Commands.triggers.look(session, '');
        }
      }
    }
  }
}

module.exports = new Command();
