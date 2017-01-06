var Command = function() {
  this.trigger = 'tell';
  this.helpText = `
  Tell another player something.

  %yellow%Usage:%yellow%
         tell <player> <message>

  %yellow%Example:%yellow%
         > tell dent You're a jerk Dent. A complete kneebiter.
         >
         > %red%You tell Dent 'You're a jerk Dent. A complete kneebiter.%red%
  `;
  this.callback = function (session, input) {
    var commandParts = input.split(' ');
    var targetCharacterName = commandParts.splice(0, 1);
    var message = commandParts.join(' ');
    var targetCharacterId = characters.searchActiveCharactersByName(targetCharacterName);

    // Bail if we can't find them.
    // TODO: include mobs in list of findables? Support 2.<thing> notation?
    if (targetCharacterId === false) {
      session.error('There is nobody around with that name.');
    }
    for (var i = 0; i < Sessions.length; ++i) {
      var targetSession = Sessions[i];
      if (targetSession.character.id === targetCharacterId) {
        var senderName = session.character.name;
        var recipientName = targetSession.character.name;
        // tell them
        targetSession.write(Tokens.replace(session, '%red%' + senderName + " tells you:" + message + '%red%'));
        // echo to sender
        session.write(Tokens.replace(session, "%red%You tell " + recipientName + ": " + message + '%red%'));
        break;
      }
    }
  }
}

module.exports = new Command();
