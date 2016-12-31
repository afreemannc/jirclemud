var Command = function() {
  this.trigger = 'dig';
  this.helpText = '';
  this.callback = function(socket, input) {
    if (input.length === 0) {
      socket.playerSession.error('Dig where??\n');
    }
    else {
      var roomId = socket.playerSession.character.currentRoom;
      // It would be nonsensical to permit digging in a direction with a pre-existing exit.
      if (typeof global.rooms.room[roomId].exits[input] !== 'undefined') {
        socket.playerSession.error('An exit already exists in that direction');
      }
      fieldValues = {
        name: 'Empty space',
        full_description: 'Empty space just waiting to be filled. Remind you of Prom night?'
      }
      global.rooms.saveRoomChanges(socket, fieldValues).then((response) => {
        // create exit from current room to new room.
        var exitValues = {
          rid: socket.playerSession.character.currentRoom,
          zid: global.zones.getCurrentZoneId(socket),
          target_rid: response.rid,
          label: input,
          description: 'Nothing to see here.',
          properties: [],
        }
        global.rooms.saveExit(socket, exitValues).then((response) => {
          //create reciprocal exit in new room. Flip values and save.
          exitValues.rid = response.rid;
          exitValues.target_rid = socket.playerSession.character.currentRoom;
          exitValues.label = global.rooms.invertExitLabel(label);
          global.rooms.saveExit(socket, exitValues).then((response) => {
            global.commands.triggers.look(socket, '');
          });
        });
      });
    }
  }

}

module.exports = new Command();
