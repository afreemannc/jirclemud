// Character class info
color = require('colors/safe');

var classes = function(){};

classes.prototype.list = function() {
  var list = ['cleric','fighter','paladin','mage','thief'];
  return list;
}

classes.prototype.cleric = {
  name: 'cleric',
  label: '[::c::]leric',
  selectOption: 'c',
  description: 'Godbothering for fun and profit. Mostly profit. Two words: collection plate.',
  flags: ['DIVINE_CASTER', 'MEDIUM_ARMOR'],
  hitDice: '1d6',
  primaryStat: 'wisdom'
}

classes.prototype.fighter = {
  name: 'fighter',
  label: '[::f::]ighter',
  selectOption: 'f',
  description: 'Dumb, strong, heavily armed. What more do you want?',
  flags: ['HEAVY_ARMOR', 'MEDIUM_ARMOR'],
  hitDice: '1d10',
  primaryStat: 'strength'
}

classes.prototype.paladin = {
  name: 'paladin',
  label: '[::p::]aladin',
  selectOption: 'p',
  description: 'Seminary frowned on stabbing things so here you are.',
  flags: ['MEDIUM_ARMOR', 'HEAVY_ARMOR', 'DIVINE_CASTER'],
  hitDice: '1d8',
  primaryStat: 'wisdom'
}

classes.prototype.mage = {
  name: 'mage',
  label: '[::m::]age',
  selectOption: 'm',
  description: "Imagine a ragey librarian who could blow shit up just by mumbling and giving it the finger. Yeah.",
  flags: ['CASTER', 'LIGHT_ARMOR'],
  hitDice: '1d4',
  primaryStat: 'intelligence',
}

classes.prototype.thief = {
  name: 'thief',
  label: '[::t::]hief',
  selectOption: 't',
  description: "Because acting like a meth head is somehow glamorous in a fantasy setting.",
  flags: ['MEDIUM_ARMOR'],
  hitDice: '1d6',
  primaryStat: 'dexterity'
}

classes.prototype.selectionOptions = function() {
  var list = this.list();
  var options = [];
  for (var i = 0; i < list.length; ++i) {
    className = list[i];
    currentClass = this[className];
    options.push(currentClass.selectOption);
  }
  return options;
}

classes.prototype.selectionTitle = function() {
  var list = this.list();
  var prompt = ':: ';
  for (var i = 0; i < list.length; ++i) {
    className = list[i];
    currentClass = this[className];
    prompt += currentClass.label + ' :: ';
  }
  return prompt + '\n';
}

classes.prototype.classFromSelection = function(selection) {
  var list = this.list();
  var options = [];
  for (var i = 0; i < list.length; ++i) {
    className = list[i];
    currentClass = this[className];
    if (currentClass.selectOption === selection) {
      return currentClass;
    }
  }
  return false;
}

module.exports = new classes();
