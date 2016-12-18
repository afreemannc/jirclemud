function Commands() {
  this.commands = {};
  this.triggers = {};
  // Load core commands
  var normalizedPath = require("path").join(__dirname, "core");

  var coreCommands = require("fs").readdirSync(normalizedPath)
  for(i = 0; i < coreCommands.length; ++i) {
    command = require("./core/" + coreCommands[i]);
    this.commands[command.trigger] = command;
    this.triggers[command.trigger] = command.callback;
  }

  // Load optional plugins
  normalizedPath = require("path").join(__dirname, "plugins");

  var pluginCommands = require("fs").readdirSync(normalizedPath);
  for(i = 0; i < pluginCommands.length; ++i) {
    command = require("./plugin/" + pluginCommands[i]);
    // Intentionally skipping checks for pre-existing commands.
    // This permits individual implementations to override core command
    // behavior by declaring a custom version of the command in the
    // plugins directory.
    this.commands[command.trigger] = command;
    this.triggers[command.trigger] = command.callback;
  }

  this.commandHandler  = function(socket, inputRaw, connection) {
    var input = inputRaw.toString().toLowerCase().replace(/(\r\n|\n|\r)/gm,"");
    var commandFound = false;
    var commandSegments = inputRaw.split(' ');
    var command = commandSegments[0];
    commandSegments.splice(0, 1);
    var arg = commandSegments.join(' ');

    // If input matches an exit label for the current room treat as move.
    if (global.rooms.inputIsExit(socket, input) === true) {
      this.triggers.move(socket, input);
      commandFound = true;
    }
    // Otherwise lets check available commands
    var keys = Object.keys(this.commands);

    for (i = 0; i < keys.length; ++i) {
      if (keys[i].startsWith(command)) {
        this.triggers[keys[i]](socket, arg);
        commandFound = true;
        break;
      }
    }

    if (commandFound === false) {
      socket.write('wut\n');
    }

  }
}

module.exports = new Commands();
