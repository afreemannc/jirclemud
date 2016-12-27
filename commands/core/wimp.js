var Command = function() {
  this.trigger = 'wimp';

  // This command should only show up in help if characters are allowed to wimp
  if (global.config.wimpEnabled === true) {
    this.helpText = "Use the wimp command to automatically flee a fight when your character's hitpoints drop below a certain level.";
  }
  else {
    this.helpText = '';
  }
  this.callback = function (socket, input) {
    if (input <= socket.playerSession.character.stats.maxhp / 2) {
      socket.playerSession.character.stats.wimp = input;
      socket.playerSession.write('Wimp set to ' + input + ' hitpoints.');
    }
    else {
      socket.playerSession.write('Wimp cannot be set to more than half your total hitpoints.');
    }
  }
}

module.exports = new Command();
