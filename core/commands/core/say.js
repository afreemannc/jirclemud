var Command = function() {
  this.trigger = 'say';
  this.helpText = `
  Say something out loud. Note: any players in the room will hear this.

  %yellow%Usage:%yellow%
         say <message>

  %yellow%Example:%yellow%
         > say hi
         >
         > %bold%You say 'hi'%bold%
  `;
  this.callback = function (session, input) {
    var roomId = session.currentRoom;
    var name = session.character.name;
    var characterID = session.character.id;
    var playerMessage = "You say:" + input + "\n";
    var roomMessage = name + " says:" + input + "\n";
    Rooms.message(session, roomId, roomMessage, true);
    session.write(playerMessage);
  }

}

module.exports = new Command();
