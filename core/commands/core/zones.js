var Command = function() {
  this.trigger = 'zones';
  this.helpText = 'List all zones';
  this.callback = function (session, input) {
    var output = '';
    // Keys are unpredictable and very likely non-sequential between zone deletes and module imports.
    var difficulty = {};
    var zoneKeys = Object.keys(Zones.zone);
    var zone = false;
    for (var i = 0; i < zoneKeys.length; ++i) {
      var zone = Zones.zone[zoneKeys[i]];
      if (typeof difficulty[zone.rating] === 'undefined') {
        difficulty[zone.rating] = {};
      }
      difficulty[zone.rating][zone.zid] = zone.name;
    }
    var difficultyKeys = Object.keys(difficulty);
    for (var i = 0; i < difficultyKeys.length; ++i) {
      output += Tokens.replace(session, '\n\n%yellow%Difficulty ' + difficultyKeys[i] + '%yellow%\n');
      zoneKeys = Object.keys(difficulty[difficultyKeys[i]]);
      for (var j =0; j < zoneKeys.length; ++j) {
        output += '  ' + zoneKeys[j] + ': ' + difficulty[difficultyKeys[i]][zoneKeys[j]] + '\n';
      }
    }
    session.write(output);
  }

}

module.exports = new Command();
