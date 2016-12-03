// Just session things

function session(socket, user) {
  this.socket = socket;
  this.mode = false;
  this.user = false;
  this.pass = false;
  this.characterId = '';
  this.roomId = '';
  
  this.prompt = function(message, property) {
    this.socket.write(message);
    this.expectedInput = property;
  }
  
  this.modeSelect = function(input) {
    if (this.mode === 'start') {
      if (input === 'l' || input === 'L') {
        this.mode = 'login';
        user.login(this.socket, input);
        
      }
      else if  (input === 'c' || input === 'C') {
        this.mode = 'character';
        user.create(socket, true);
      }
      else {
        var message = input + ' is not a valid option\n';
        this.prompt("[L]ogin or [C]reate a character\n", 'start');
      }
    }
  }
}


module.exports = session;
