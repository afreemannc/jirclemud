var Command = function() {
  this.trigger = 'where';
  this.helpText = 'Displays information about the zone you are in.';
  this.callback = function (session, input) {
    var roomId = session.character.currentRoom;
    var room = global.rooms.room[roomId];
    var zoneId = room.zid;
    var zone = Zones.zone[zoneId];
    var output = Tokens.replace(session, '%cyan%' + zone.name + '%cyan%') + '\n';
    output += Tokens.replace(session, '%yellow%Difficulty:' + zone.rating + '%yellow%') + '\n';
    output += zone.description;
    session.write(output);
  }

}

module.exports = new Command();
