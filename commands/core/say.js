var Command = function() {
  this.trigger = 'say';
  this.helpText = '';
  this.callback = function (session, input) {
    var roomId = session.currentRoom;
    var name = session.character.name;
    var characterID = session.character.id;
    var playerMessage = "You say:" + input + "\n";
    var roomMessage = name + " says:" + input + "\n";
    global.rooms.message(session, roomId, roomMessage, true);
    session.write(playerMessage);
  }

}

module.exports = new Command();
