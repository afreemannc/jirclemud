var Command = function() {
  this.trigger = 'equipment';
  this.helpText = `
  List equipment you are wearing.

  %yellow%Usage:%yellow%
         equiment

  %yellow%Example:%yellow%
         > equipment
         >
         > %cyan%<worn on waist>%cyan% %bold%A colorful codpiece%bold%
         >
         > %red%Dent tells you 'Ghaa would you put on some pants or something?'%red%
  `;
  this.callback = function (session, input) {
    var display = Items.inventoryDisplay(session.character.equipment);
    var output = 'Currently worn:\n' + display + '\n';
    session.write(Tokens.replace(output));
  }
}

module.exports = new Command();
