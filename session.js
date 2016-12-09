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
    var hp = this.character.properties.currenthp;
    var mana = this.character.properties.currentmana;
    var prompt = global.color.red('H:' + hp);
    prompt += ' | ';
    prompt += global.color.blue('M:' + mana);
    prompt += ' >\n';

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
