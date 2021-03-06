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
    var targetCharacterSession = Characters.searchActiveCharactersByName(targetCharacterName);
    var recipientName = targetCharacterSession.character.name;

    // Bail if we can't find them.
    // TODO: include mobs in list of findables? Support 2.<thing> notation?
    if (targetCharacterSession === false) {
      session.error('There is nobody around with that name.');
    }
    else {
      // tell them
      targetCharacterSession.write(Tokens.replace('%red%%character.name%  tells you:' + message + '%red%', {character:session.character}));
      // echo to sender
      session.write(Tokens.replace("%red%You tell " + recipientName + ": " + message + '%red%'));
    }
  }
}

module.exports = new Command();
