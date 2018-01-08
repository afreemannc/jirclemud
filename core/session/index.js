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
    var prompt = Tokens.replace(Config.playerPrompt, {character: this.character});
    return "\n" + prompt;
  }

  /**
   * Display a message to this session.
   *
   * @param message
   *   Message to display.
   */
  this.write = function(message){
    this.socket.write(message);
    this.socket.write(this.characterPrompt());
  }

  /**
   * Display an error message to this session.
   *
   * @param message
   *   Error message to display.
   */
  this.error = function(message) {
    this.socket.write(Tokens.replace('%red%' + message + '%red%'));
    this.socket.write(this.characterPrompt());
  }

  /**
   * Player start prompt.
   */
  this.start = function() {
    this.socket.write('Welcome to ' + Config.mudName + '\n');
    // The standard prompt bailout doesn't make sense on this screen.
    Prompt.start('sessionstart', this);
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

  // Register user login/create prompt
  this.registerPrompt = function() {
    var fields = [];
    fields['start'] = {
      name: 'start',
      type: 'select',
      title: '[::l::]og in, [::c::]reate a character, or [::q::]uit',
      options: {l:'l', c:'c', q:'q'},
      replaceInPrefix: true,
    }
    Prompt.register('sessionstart', fields, this.startSwitch, false);
  }
  this.registerPrompt();
}

module.exports.new = function() {
  return new Session();
}
