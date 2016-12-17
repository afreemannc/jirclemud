function Commands() {
  this.commands = {};
  // Load core commands
  var normalizedPath = require("path").join(__dirname, "core");

  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    command = require("./core/" + file);
    this.commands[command.trigger] = command;
  });

  // Load optional plugins
  normalizedPath = require("path").join(__dirname, "plugins");

  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    command = require("./plugin/" + file);
    // Intentionally skipping checks for pre-existing commands.
    // This permits individual implementations to override core command
    // behavior by declaring a custom version of the command in the
    // plugins directory.
    this.commands[command.trigger] = command;
  });

  this.commandHandler  = function(socket, inputRaw, connection) {
    var commandSegments = inputRaw.split(' ');
    var command = commandSegments[0];
    commandSegments.splice(0, 1);
    var arg = commandSegments.join(' ');
    // If input matches an exit label for the current room treat as move.
    if (global.rooms.inputIsExit(socket, inputRaw) === true) {
      return;
    }

    if (typeof this.commands[command] !== 'undefined') {
      this.commands[command].callback(socket, arg);
    }
    else {
       socket.write('wut\n');
    }
  }
}

module.exports = new Commands();
