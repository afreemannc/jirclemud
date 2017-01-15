var Command = function() {
  this.trigger = 'gossip';
  this.helpText = `
  Send a chat message to everyone in the game. Note: players who have NO GOSSIP turned on will not hear you.

  %yellow%Usage:%yellow%
         gossip <message>

  %yellow%Example:%yellow%
         > %yellow%Mourn: Derp has been killed by a boiling river of blood and fire%yellow%
         >
         > gossip LOL RIP
         >
         > %magenta%Dent gossips: LOL RIP%magenta%
  `;
  this.callback = function (session, input) {
    var message = Tokens.replace("%magenta%[gossip] %character.name%: " + input + "%magenta%\n", {character:session.character});
    Rooms.message(session, false, message, false);
  }

}

module.exports = new Command();
