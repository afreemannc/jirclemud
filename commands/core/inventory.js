var Command = function() {
  this.trigger = 'inventory';
  this.helpText = 'Shows a list of items you are currently carrying.';
  this.callback = function (session, input) {
    var display = global.items.inventoryDisplay(session, session.character.inventory);
    var output = 'You are carrying:\n' + display + '\n';
    session.write(output);
  }
}

module.exports = new Command();
