var Command = function() {
  this.trigger = 'inventory';
  this.helpText = `
  List items you are currently carrying in your inventory.

  %yellow%Usage:%yellow%
         inventory

  %yellow%Example:%yellow%
         > inventory
         >
         > %bold%You are currently carrying:%bold%
         > %bold%a waybread%bold%
         > %bold%a small flask%bold%
         > %bold%an unlit torch%bold%
  `;
  this.callback = function (session, input) {
    var display = Items.inventoryDisplay(session.character.inventory);
    var output = 'You are carrying:\n' + display + '\n';
    session.write(output);
  }
}

module.exports = new Command();
