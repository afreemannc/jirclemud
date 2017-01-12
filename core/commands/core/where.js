var Command = function() {
  this.trigger = 'where';
  this.helpText = `
  This command displays information about the zone you are in, or shows the room location of a player or mob.

  %yellow%Usage:%yellow%
         zone detains: where
         player location: where <player name>

  %yellow%Usage:%yellow%
         > where
         >
         > %bold%Zone you're in: Dockside - Zone 15%bold%
         > %bold%Zone Difficulty: 2%bold%
         > %bold%Players in your zone%bold%
         > %bold%--------------------%bold%
         > %bold%Derp                 - Dingy Tavern
  `;
  this.callback = function (session, input) {
    if (!input) {
      var roomId = session.character.current_room;
      var zoneId = Rooms.room[roomId].zid;
      var zone = Zones.zone[zoneId];
      var output = "Zone you're in: " + zone.name + ' - Zone ' + zoneId + '\n';
      output += 'Zone Difficulty:' + zone.rating + '\n';
      output += 'Players in your Zone\n';
      output += '--------------------\n';
      output += Zones.listPlayersInZone(zoneId) + '\n';
      session.write(output);
    }
  }
  else {
    var targetCharacterSession = searchActiveCharactersByName(input);
    if (targetCharacterSession === 'false') {
      session.write('Nobody around by that name.');
      return false;
    }
    var targetRoomId = targetCharacterSession.character.current_room;
    var targetZid = Rooms.room[roomId].zid;
    if (targetZid !== zoneId) {
      session.write('Nobody around by that name.');
      return false;
    }
    session.write(character.name + '          - ' + Rooms.room[character.current_room].name + "\n");
  }

}

module.exports = new Command();
