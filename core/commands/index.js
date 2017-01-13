var fs = require("fs");
var path = require("path");

function commands() {
  this.commands = {};
  this.triggers = {};
  // Load core commands
  var normalizedPath = require("path").join(__dirname, "core");

  var coreCommands = require("fs").readdirSync(normalizedPath);
  for (var i = 0; i < coreCommands.length; ++i) {
    if (coreCommands[i].endsWith('.js')) {
      var command = require("./core/" + coreCommands[i]);
      this.commands[command.trigger] = command;
      this.triggers[command.trigger] = command.callback;
    }
  }
}

  // Load optional plugins
commands.prototype.loadCommands = function(dir) {

  var pluginCommands = require("fs").readdirSync(dir);
  for (var i = 0; i < pluginCommands.length; ++i) {
    if (pluginCommands[i].endsWith('.js')) {
      var file = pluginCommands[i];
      var command = require(dir + "/" + file);
      // Intentionally skipping checks for pre-existing commands.
      // This permits modules and custom implementations to override core command
      // behavior by declaring a custom version of the command in the
      // plugins directory.
      Commands.commands[command.trigger] = command;
      Commands.triggers[command.trigger] = command.callback;
    }
  }
}

commands.prototype.commandHandler  = function(session, inputRaw) {
    console.log('inputRaw:' + inputRaw);
    console.log(typeof inputRaw);
    var input = inputRaw.replace(/(\r\n|\n|\r)/gm,"");
    // Prevent user session from dropping into limbo if a blank newline is sent.
    if (input === '') {
      return;
    }
    var commandFound = false;
    var commandSegments = input.split(' ');
    var command = commandSegments[0].toLowerCase();
    commandSegments.splice(0, 1);
    var arg = commandSegments.join(' ');

    // If input matches an exit label for the current room treat as move.
    if (Rooms.inputIsExit(session, input) === true) {
      this.triggers.move(session, input);
      return;
    }
    // Otherwise lets check available commands
    var keys = Object.keys(this.commands);

    for (var i = 0; i < keys.length; ++i) {
      if (keys[i].startsWith(command)) {
        this.triggers[keys[i]](session, arg);
        commandFound = true;
        break;
      }
    }

    if (commandFound === false) {
      session.write('Do what??\n');
    }

  }


module.exports = new commands();
