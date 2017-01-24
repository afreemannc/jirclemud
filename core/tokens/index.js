// @file Token Replacement class

var colors = require('colors/safe');

/**
 * Perform token replacement based on supplied values.
 *
 * @param string
 *   String to perform token replacement on.
 *
 * @param values
 *   An object containing keyed instances of any objects that should be used to perform token replacement.
 *   Example:
 *     '%character.name%' token is replaced with value in values['character'].name if set.
 *     '%room.name% token is replaced with value in values['room'].name if set.
 *
 * @return
 *   Returns a copy of "string" with tokens replaced.
 */
module.exports.replace = function(string, values) {
  // Attempt token replacement from objects passed in values.
  if (values) {
    var valueKeys = Object.keys(values);
    for (var i = 0; i < valueKeys.length; ++i) {
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

/**
 * Recursively check for and replace object property tokens.
 *
 * @param string
 *   String to perform token replacement on
 *
 * @param target
 *   Object that token values are taken from
 *
 * @param token
 *   Token string based on current position in target.
 *   Example:
 *     if a character object is passed in as target token starts as 'character'
 *     this is expanded to character.name when name token is checked.
 *     this continues until all properties of the target object have been checked.
 *
 * @return
 *   Returns string with tokens replaced.
 */
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

