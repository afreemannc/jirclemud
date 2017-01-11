var Command = function() {
  this.trigger = 'emote';
  this.helpText = `
  The emote commands lets your character perform complex custom socials.

  %yellow%Usage:%yellow%
         emote <description of your character's action>

  %yellow%Usage:%yellow%
         > emote dances on the bar.
         >
         > %bold%Derp dances on the bar.%bold%
  `;
  this.callback = function (session, input) {
    var roomId = session.character.current_room;
    Rooms.message(session, roomId, input, false);
  }
}

module.exports = new Command();
