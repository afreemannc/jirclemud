var Command = function() {
  this.trigger = 'tell';
  this.helpText = 'Tell another player something.';
  this.callback = function (socket, input) {
    commandParts = input.split(' ');
    targetCharacterName = commandParts.splice(0, 1);
    message = commandParts.join(' ');
    targetCharacterId = global.user.searchActiveCharactersByName(targetCharacterName);
    // Bail if we can't find them.
    // TODO: include mobs in list of findables? Support 2.<thing> notation?
    if (targetCharacterId === false) {
      socket.playerSession.error('There is nobody around with that name.');
    }
    for (i = 0; i < global.sockets.length; ++i) {
      targetSocket = global.sockets[i];
      if (targetSocket.playerSession.character.id === targetCharacterId) {
        senderName = socket.playerSession.character.name;
        recipientName = targetSocket.playerSession.character.name;
        // tell them
        targetSocket.playerSession.write(global.colors.red(senderName + " tells you:" + message));
        // echo to sender
        socket.playerSession.write(global.colors.red("You tell " + recipientName + ": " + message));
        break;
      }
    }
  }
}

module.exports = new Command();
