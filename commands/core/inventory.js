var Command = function() {
  this.trigger = 'inventory';
  this.helpText = 'Shows a list of items you are currently carrying.';
  this.callback = function (socket, input) {
    var display = global.items.inventoryDisplay(socket, socket.playerSession.character.inventory);
    var output = 'You are carrying:\n' + display + '\n';
    socket.playerSession.write(output);
  }
}

module.exports = new Command();
