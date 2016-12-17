var Command = function() {
  this.trigger = 'say';
  this.helpText = '';
  this.callback = function (socket, input) {
    roomId = socket.playerSession.currentRoom;
    name = socket.playerSession.character.name;
    characterID = socket.playerSession.character.id;
    var playerMessage = "You say:" + input + "\n";
    var roomMessage = name + " says:" + input + "\n";
    global.rooms.message(socket, roomId, roomMessage, true);
    socket.playerSession.write(playerMessage);
  }

}

module.exports = new Command();
