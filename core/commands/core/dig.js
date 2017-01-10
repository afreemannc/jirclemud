
var Command = function() {
  this.trigger = 'dig';
  this.helpText = `
    The dig command is used to add rooms to a zone..
    When used several things happen in order:
      - a new empty room is created
      - exits are created linking the room you are in to this new room
      - you are moved to the new room

    %yellow%Usage:%yellow%
           dig <direction>

    %yellow%Example:%yellow%
          > dig e
          > dig d
  `;
  this.callback = function(session, input) {
    if (input.length === 0) {
      session.error('Dig where??\n');
    }
    else {
      var roomId = session.character.current_room;
      // It would be nonsensical to permit digging in a direction with a pre-existing exit.
      if (typeof Rooms.room[roomId].exits[input] !== 'undefined') {
        session.error('An exit already exists in that direction');
      }
      var Room = Models.Room;
      var values = {
        zid: Zones.getCurrentZoneId(session),
        name: 'Empty space',
        description: 'Empty space just waiting to be filled. Remind you of Prom night?',
        flags: JSON.stringify([])
      }
      console.log(values);
      Room.create(values).then(function(roomInstance) {
        var newRoom = roomInstance.dataValues;
        newRoom['exits'] = {};
        newRoom['inventory'] = [];
        // Add new room to memory
        Rooms.room[newRoom.rid] = newRoom;
        var Container = Models.Container;
        var containerValues = {
          container_type: 'room',
          parent_id: newRoom.rid,
          max_size: -1,
          max_weight: -1,
        }
        // This can happen asyncronously so no need for .then().
        Container.create(containerValues);
        // create exit from current room to new room.
        var exitValues = {
          rid: session.character.current_room,
          target_rid: newRoom.rid,
          label: input,
          description: 'Nothing to see here.',
          properties: JSON.stringify({flags:[]}),
        }
        var RoomExit = Models.RoomExit;
        RoomExit.create(exitValues).then(function(exitInstance) {
          // Update memory with new exit
          Rooms.room[exitInstance.get('rid')].exits[exitInstance.get('label')] = exitInstance.dataValues;
          //create reciprocal exit in new room. Flip values and save.
          var exitValues = {
            rid: newRoom.rid,
            target_rid: session.character.current_room,
            label: Rooms.invertExitLabel(input),
            properties: JSON.stringify({flags:[]}),
          }
          RoomExit.create(exitValues).then(function (exitInstance) {
            // Update memory with new exit
            Rooms.room[exitInstance.get('rid')].exits[exitInstance.get('label')] = exitInstance.dataValues;
            // once exits are saved move the character to the new room.
            Commands.triggers.move(session, input);
          });
        }).catch(function(error) {
          console.log('Dig Error: failed to create leading exit:' + error);
        });
      }).catch(function(error) {
        console.log('Dig Error: failed to create new room:' + error);
      });
    }
  }
}

module.exports = new Command();
