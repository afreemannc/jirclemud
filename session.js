// Just session things
var user = require('./user');

function session(socket) {
  this.inputContext = 'start';
  this.socket = socket;
  this.mode = false;
  this.user = false;
  this.pass = false;
  this.characterId = '';
  this.roomId = '';

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
}


module.exports = session;
