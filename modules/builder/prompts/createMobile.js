/**
 * @file
 * Mobile creation prompt
 */

function createMobile() {
  this.id = 'create_mobile';
  this.completionCallback = Mobiles.saveMobile;
  this.quittable = true;
  this.fields = {
    'zid' = {
      name: 'zid',
      type: 'value',
      value: '',
    }
    'name': {
      name: 'name',
      type: 'text',
      title: 'What should this mobile be named? (Name displays in room.)'
    }
    'short_name': {
      name: 'short_name',
      type: 'text',
      title: 'Provide a short name: (Displays during move, by "scan", etc.)'
    }
    'description': {
      name: 'description',
      type: 'multitext',
      title: 'Describe this mobile. (Description displayed by "look" command'
    }
    'hp': {
      name: 'hp',
      type: 'int',
      title: 'How many hitpoints does this mob have?',
    }
    // TODO: this should be altered into existence as needed by world mechanics module
    'mana': {
      name: 'mana',
      type: 'int',
      title: 'How many mana points does this mob have?'
    }

    'level': {
      name: 'level',
      type: 'int',
      title: 'What level is this mob?'
    }
    'hit': {
      name: 'hit',
      type: 'int',
      title: 'To hit bonus:'
    }
    'dam': {
      name: 'dam',
      type: 'int',
      title: 'Damage bonus:'
    }

    // TODO: flags field and options should be defined by world mechanics module
    'flags': {
      name: 'flags',
      type: 'multiselect',
      title: 'What additional flags should this mob have?',
      options: {n:'NONE', c:'CASTER', p:'PATROL', s:'SKILLED', a:'AGGRO', z:'ZONEHUNTER', w:'WORLDHUNTER'}
    }
    // Placeholder until spells/skills are a thing
    'effects': {
      name: 'effects',
      type: 'value',
      value: JSON.stringify([])
    }
    // Note: extra is a placeholder for any additional data required by complex mobprogs.
    'extra': {
      name: 'extra',
      type: 'value',
      value: JSON.stringify([])
    }
  }
}
