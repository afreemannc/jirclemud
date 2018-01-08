var Classes = require('./classes/index.js');

function Module() {
  this.name = 'Dikuesque';
  this.description = 'Game mechanics loosely patterned off of DikuMud.'
  this.install = false;
  this.features = ['commands'];
  this.load = function() {
    // Set available item flags
    Items.flags = {
      0:  'NONE',
      f:  'FOOD',
      d:  'DRINK',
      c:  'CONTAINER',
      i:  'INVISIBLE',
      ni: '!INVISIBLE',
      we: 'WEARABLE',
      u:  'CURSE',
      b:  'BLESS',
      h:  'HUM',
      ta: 'TAKE',
      wi: 'WIELD',
      h:  'HOLD',
      th: 'TWO-HANDED',
      p:  'POTION',
      po: 'PORTAL',
      li: 'LIGHT',
      w:  'WAND',
      s:  'SCROLL',
      nta: '!TAKE'
    }
    // Flesh out the character creation form fields.
    characterCreationPrompt = Prompt.getPrompt('createcharacter');

    characterCreationPrompt.fields['class'] = {
      name: 'class',
      type: 'select',
      title: Classes.selectionTitle(),
      options: Classes.selectionOptions(),
      replaceInPrefix: true
    }

    characterCreationPrompt.fields['stats'] = {
      name: 'stats',
      type: 'multiselect',
      title: '[::s::]trength, [::c::]onstitution, [::d::]exterity\n[::i::]ntelligence, [::w::]isdom, [::ch::]harisma',
      options: {s:'str', c:'con', d:'dex', i:'int', w:'wis', ch:'cha'},
      replaceInPrefix: true
   }

   //TODO: replace form completion callback
  }
}

module.exports = new Module();
