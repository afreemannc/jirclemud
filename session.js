// Just session things
var user = require('./user');

function session(socket) {
  this.inputContext = 'start';
  this.socket = socket;
  this.mode = false;
  this.user = false;
  this.pass = false;
  this.characterId = '';

  this.getInputContext = function() {
    var context = this.inputContext.split(':');
    if (context.length === 1) {
      return {context: context[0], params: false};
    }
    else {
      var primary = context[0];
      context.splice(0, 1);
      return {context: primary, params: context};
    }
  }

  this.characterPrompt = function() {
    // Prompt is configurable in config.js.
    // @see comments in config.js.example for details.
    var prompt = global.config.playerPrompt;
    var stats = this.character.stats;
    console.log(stats);
    var statKeys = Object.keys(stats);
    // Replace stat values in prompt
    for (i = 0; i < statKeys.length; ++i) {
      stat = statKeys[i];
      if (prompt.includes('%' + stat + '%')) {
        prompt = prompt.replace('%' + stat + '%', this.character.stats[stat]);
      }
    }
    // Handle colors style options
    var colorKeys = Object.keys(global.colors.styles);
    for (i = 0; i < colorKeys.length; ++i) {
      style = colorKeys[i];
      if (prompt.includes('%' + style +'%')) {
        regex = new RegExp('%' + style +'%([\\w\\s]+)%' + style + '%', 'g');
        prompt = prompt.replace(regex, function(match, capture) {
          return colors[style](capture);
        });
      }
    }
    return "\n" + prompt;
  }

  this.write = function(message){
    this.socket.write(message);
    this.socket.write(this.characterPrompt());
  }

  this.error = function(message) {
    this.socket.write(global.color.red(message));
    this.socket.write(this.characterPrompt());
  }

}


module.exports = session;
