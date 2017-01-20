var Command = function() {
  this.trigger = 'save';
  this.helpText = `
  Save your character progress.

  %yellow%Usage:%yellow%
         save

  %yellow%Usage:%yellow%
         > Save
         >
         > %bold%Character saved.%bold%
         >
  `;
  this.callback = function (session, input) {
    var Character = Models.Character;
    var id = session.character.id;
    var values = {
      perms: JSON.stringify(session.character.perms);
      stats: JSON.stringify(session.character.stats);
      effects: JSON.stringify(session.character.effects);
      equipment: JSON.stringify(session.character.equipment);
      inventory: JSON.stringify(session.character.inventory);
    }
    Character.update(values, {where:{id:id}}).then(function() {
      session.write('Character saved.');
    }
  }
}

module.exports = new Command();
