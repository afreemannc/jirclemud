var Command = function() {
  this.trigger = 'enter';
  this.helpText = 'Enter a gate or portal.';
  this.callback = function (session, input) {
    var roomId = session.character.currentRoom;
    var name = session.character.name;
    var itemIndex = global.containers.findItemInContainer(input, 'name', global.rooms.room[roomId].inventory, true);
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
          return false;
        }
        else {
          session.character.currentRoom = target_rid;
          session.socket.write('You step into the ' + portal.name + ' and disappear.');
          global.commands.triggers.look(session, '');
        }
      }
    }
  }
}

module.exports = new Command();
