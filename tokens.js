// Token Replacement

module.exports.replace = function(socket, string) {
  var character = socket.playerSession.character;
  var statKeys = Object.keys(character.stats);

  // Replace character stat tokens
  for (i = 0; i < statKeys.length; ++i) {
    stat = statKeys[i];

    if (string.includes('%' + stat + '%')) {
      string = string.replace('%' + stat + '%', character.stats[stat]);
    }
  }

  var colorKeys = Object.keys(global.colors.styles);

  // Handle colors style options
  for (i = 0; i < colorKeys.length; ++i) {
    style = colorKeys[i];

    if (string.includes('%' + style +'%')) {
      // Ex: %red%30H%red% should result in "30H" piped through colors.red()
      regex = new RegExp('%' + style +'%([\\w\\s]+)%' + style + '%', 'g');
      // Match: entire string matching the regex above
      // Capture: the portion of the match between the color tokens.
      string = string.replace(regex, function(match, capture) {
        return global.colors[style](capture);
      });
    }
  }

  return string;
}
