// Just session things
function Session() {
  this.character = {};
  this.inputContext = 'start';
  this.socket = false;

  /**
   *  Display character command prompt.
   */
  this.characterPrompt = function() {
    // Prompt is configurable in config.js.
    // @see comments in config.js.example for details.
    var prompt = Tokens.replace(this, Config.playerPrompt);
    return "\n" + prompt;
  }

  this.write = function(message){
    this.socket.write(message);
    this.socket.write(this.characterPrompt());
  }

  this.error = function(message) {
    this.socket.write(Token.replace(this, '%red%' + message + '%red%'));
    this.socket.write(this.characterPrompt());
  }

  this.start = function() {
    var message = 'Welcome to ' + Config.mudName + '\n';
    // TODO: display splash screen.
    var startPrompt = Prompt.new(this, this.startSwitch);
    // The standard prompt bailout doesn't make sense on this screen.
    startPrompt.quittable = false;

    var startField = startPrompt.newField('select');
    startField.name = 'start';
    startField.options = {l:'l', c:'c', q:'q'};
    startField.formatPrompt('[::l::]og in, [::c::]reate a character, or [::q::]uit', true);
    startPrompt.addField(startField);

    startPrompt.start();
  }

  /**
   * Start screen prompt callback
   *
   * Switches between login and character creation modes based
   * on user input on the start screen.
   *
   * @param socket
   *   Socket object for the current user.
   *
   * @param fieldValues
   *   user-submitted values for the start prompt
   *
   */
  this.startSwitch = function(socket, fieldValues) {

    var input = fieldValues.start;
    if (input === 'l') {
      Characters.login(socket);
    }
    else if  (input === 'c') {
      Characters.createCharacter(socket);
    }
    else if (input === 'q') {
      this.socket.write(Config.quitMessage);
      Commands.triggers.quit(socket, false);
    }
  }
}


module.exports.new = function() {
  return new Session();
}
