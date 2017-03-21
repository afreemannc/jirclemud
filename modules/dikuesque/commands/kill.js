var Command = function() {
  this.trigger = 'kill';
  this.helpText = `
  Attack a mob or player (PK only).

  %yellow%Usage:%yellow%
         kill <mob name>

  %yellow%Usage:%yellow%
         > Kill chipmunk
         >
         > %bold%You viciously attack a chipmunk.%bold%
         >
  `;
  this.validate = function (session, input) {
    // check room for mob
    var roomId = session.character.current_room;
    var itemIndex = Items.findItemInContainer(input, 'name', room.mobiles, true);
    if (itemIndex !== false) {
      Mobiles.displayMobile(session, room.mobiles[itemIndex]);
      return true;
    }
    else {
      session.error('There is no ' + input + ' here to kill.');
    }
  }

  this.callback = function (session, input) {
    // ceeate combat instance
    // add player
    // add mob
    // start combat
  }

}

module.exports = new Command();
