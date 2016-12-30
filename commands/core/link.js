var Command = function() {
  this.trigger = 'link';
  this.helpText = 'Link the current room to another room. Syntax: link <direction> <target room id>. Ex: link e 110';
  this.callback = function (socket, input) {
    var inputParts = input.split(' ');

    // missing input
    if (inputParts.length < 2) {
      socket.playerSession.error('Link what??');
      return false;
    }
    else {
      var roomId = socket.playerSession.character.currentRoom;
      var currentRoom = global.rooms.room[roomId];
      var exitLabel = inputParts[0];
      var targetRid = inputParts[1];
    }
    // link direction already occupied with an exit
    console.log('current room:');
    console.log(currentRoom);
    for (i = 0; i < currentRoom.exits.length; ++i) {
      currentExit = currentRoom.exits[i];
      if (currentExit.label === exitLabel) {
        socket.playerSession.error('There is already an exit in that direction.');
        return false;
      }
    }
    // target rid is not a number;
    if (Number.isInteger(targetRid) === false) {
      socket.playerSession.error('Target room id specified is incorrect. The room id must be a number.');
      return false;
    }

    // link attempt to a nonexistent room id
    if (typeof global.rooms.room[targetRid] === 'undefined') {
      socket.playerSession.error('Room ' + targetRid + ' does not exist.');
      return false;
    }

    var values = {
      rid: socket.playerSession.character.currentRoom,
      target_rid: targetRid,
      label: exitLabel,
      description: '',
    }
    //global.rooms.saveExit(socket, fieldValues, false, false);
  }

}

module.exports = new Command();
