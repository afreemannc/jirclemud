// Just session things
function Session(socket) {
  this.inputContext = 'start';
  this.socket = socket;

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

  /**
   *  Display character command prompt.
   */
  this.characterPrompt = function() {
    // Prompt is configurable in config.js.
    // @see comments in config.js.example for details.
    var prompt = global.tokens.replace(this.socket, global.config.playerPrompt);
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

  this.start = function(socket) {
    var message = colors.green('Welcome to ' + global.config.mudName + "\n");
    // TODO: display splash screen.
    var startPrompt = prompt.new(socket, this.startSwitch);
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
      characters.login(socket);
    }
    else if  (input === 'c') {
      characters.createCharacter(socket);
    }
    else if (input === 'q') {
      socket.write(global.config.quitMessage);
      global.commands.quit(socket, false);
    }
  }
}


module.exports = new Session();
