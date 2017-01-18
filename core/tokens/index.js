// Token Replacement
var colors = require('colors/safe');
// TODO: make session optional, add support for additional token types (room, zone, etc)
module.exports.replace = function(string, values) {
  if (values) {
    var valueKeys = Object.keys(values);
    for (i = 0; i < valueKeys.length; ++i) {
      var value = valueKeys[i];
      // No sense in processing a thing that was passed in if there are no tokens that require it.
      if (!string.includes('%' + value)) {
        continue;
      }
      else {
        string = Tokens.replaceRecursive(string, values[value], value);
      }
    }
  }

  var colorKeys = Object.keys(colors.styles);

  // Handle colors style options
  for (var i = 0; i < colorKeys.length; ++i) {
    style = colorKeys[i];

    if (string.includes('%' + style +'%')) {
      // Ex: %red%30H%red% should result in "30H" piped through colors.red()
      regex = new RegExp('%' + style +'%([\\w?\\s?\\S?]+?)%' + style + '%', 'g');
      // Match: entire string matching the regex above
      // Capture: the portion of the match between the color tokens.
      string = string.replace(regex, function(match, capture) {
        return colors[style](capture);
      });
    }
  }

  return string;
}

module.exports.replaceRecursive = function (string, target, token) {
  for (var key in target) {
    var tokenString = token + '.' + key;
    if (!target.hasOwnProperty(key)) {
      continue;
    }
    if (typeof target[key] == "object" && target[key] !== null) {
      string = Tokens.replaceRecursive(string, target[key], tokenString);
    }
    else {
      if (string.includes('%' + tokenString + '%')) {
        string = string.replace('%' + tokenString + '%', target[key]);
      }
    }
  }
  return string;
}

