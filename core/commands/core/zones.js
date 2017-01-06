var Command = function() {
  this.trigger = 'zones';
  this.helpText = 'List all zones';
  this.callback = function (session, input) {
    var output = '';
    // Keys are unpredictable and very likely non-sequential between zone deletes and module imports.
    var difficulty = {};
    zoneKeys = Object.keys(global.zones.zone);
    for (i = 0; i < zoneKeys.length; ++i) {
      zone = global.zones.zone[zoneKeys[i]];
      if (typeof difficulty[zone.rating] === 'undefined') {
        difficulty[zone.rating] = {};
      }
      difficulty[zone.rating][zone.zid] = zone.name;
    }
    var difficultyKeys = Object.keys(difficulty);
    for (i = 0; i < difficultyKeys.length; ++i) {
      output += Tokens.replace(session, '\n\n%yellow%Difficulty ' + difficultyKeys[i] + '%yellow%\n');
      zoneKeys = Object.keys(difficulty[difficultyKeys[i]]);
      for (j =0; j < zoneKeys.length; ++j) {
        output += '  ' + zoneKeys[j] + ': ' + difficulty[difficultyKeys[i]][zoneKeys[j]] + '\n';
      }
    }
    session.write(output);
  }

}

module.exports = new Command();
