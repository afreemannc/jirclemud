var Classes = require('./classes/index.js');

function Module() {
  this.name = 'Dikuesque';
  this.description = 'Game mechanics loosely patterned off of DikuMud.'
  this.install = false;
  this.features = ['commands'];
  this.load = function() {
    // Flesh out the character creation form fields.
    console.log('added listener to prompt events');
    Events.on('prompt:createCharacter', function(characterCreationPrompt) {
      characterCreationPrompt.alterCallbacks.push(function(characterCreationPrompt) {
      console.log('form alter trigger fired');
      var classField = characterCreationPrompt.newField('select');
      classField.name = 'class';
      classField.options = Classes.selectionOptions();
      classField.formatPrompt = Classes.selectionPrompt();
      characterCreationPrompt.addField(classField);

      // Stats fields (STR, CON, DEX, INT, WIS, CHA)
      var statsField = characterCreationPrompt.newField('multiselect');
      statsField.name = 'stats';
      statsField.options = {s:'str', c:'con', d:'dex', i:'int', w:'wis', ch:'cha'};
      statsField.formatPrompt('[::s::]trength, [::c::]onstitution, [::d::]exterity\n[::i::]ntelligence, [::w::]isdom, [::ch::]harisma', true);
      characterCreationPrompt.addField(statsField);

      console.log('field add completed');
      return true;
      });
    });
  }
}

module.exports = new Module();
