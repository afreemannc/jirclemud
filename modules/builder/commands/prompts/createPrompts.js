/**
 * @file
 * Builder creation prompts.
 */
function creationPrompts() {
  itemCreationFields = [];
  itemCreationFields['zid'] = {
    name: 'zid',
    type: 'value',
    value: '',
  }

  itemCreationFields['name'] = {
    name: 'name',
    type: 'text',
    title: 'What do you want to name it? Note the name is what is displayed in personal inventory or when equipped.'
  }

  itemCreationFields['room_description'] = {
    name: 'room_description',
    type: 'text',
    title: 'Provide a short description of the item that will be shown when it is sitting out in a room.'
  }

  itemCreationFields['full_description'] = {
    name: 'full_description',
    type: 'multitext',
    title: 'Provide a thorough description. This is what will be displayed if this item is examined.'
  }

  if (typeof Config.itemScarcity !== 'undefined' && Config.itemScarcity === true) {

    itemCreationFields['max_count'] = {
      name: 'max_count',
      type: 'int',
      title: 'How many of this item can exist in the world at one time? (-1 for unlimited)'
    }

    itemCreationFields['load_chance'] = {
      name: 'load_chance',
      type: 'int',
      title: '% chance this item will load on zone respawn (100 for always)',
      maxint: 100
    }
  }

  itemCreationFields['flags'] = {
    name: 'flags',
    type: 'multiselect',
    title: 'Select one or more flags to assign to this item:
    options: Item.flags
  }

  itemCreationField['target_rid'] = {
    name: 'target_rid',
    type: 'int',
    title: 'Enter numeric room id this portal should lead to:',
    conditional: {
      field: 'flags',
      value: 'PORTAL'
    }
  }

  itemCreationField['container_size'] = {
    name: 'container_size',
    type: 'int',
    title: 'Enter container size as a number:',
    conditional: {
      field: 'flags',
      value: 'CONTAINER'
    }
  }

  itemCreationField['equipment_slot'] = {
    name: 'equipment_slot',
    type: 'select',
    title: 'Where can this be worn?',
    options: Config.equipmentSlots,
    conditional: {
      field: 'flags',
      value: 'WEARABLE'
    }
  }

  itemCreationField['damage_dice'] = {
    name: 'damage_dice',
    type: 'dice',
    title: 'Weapon base damage dice:',
    conditional: {
      field: 'flags',
      value: 'WIELD'
    }
  }

  itemCreationField['effect_type'] = {
    name: 'effect_type',
    type: 'select',
    title: 'What additional effects does this equipment have?',
    options: {d:'dam', h:'hit', a:'ac', s:'stat'},
    conditional: {
      field: 'flags',
      value: ['WIELD', 'HOLD', 'WEARABLE']
    }
  }

  itemCreationField['affected_stat'] = {
    name: 'affected_stat',
    type: 'select',
    title: 'Select a stat to buff:',
    options: {i:'int', w:'wis', ch:'cha', s:'str', co:'con', d:'dex'} // TODO: move to world mechanics module
    conditional: {
      field: 'effect_type',
      value: 'stat'
    }
  }

  itemCreationField['bonus'] = {
    name: 'bonus',
    type: 'int',
    title: 'Effect bonus (positive or negative numbers only):'
    conditional: {
      field: 'effect_type',
      value: 'stat'
    }
  }

  itemCreationField['effects'] = {
    name: 'effects',
    tyoe: 'fieldgroup',
    title: 'Do you wish to add another effect to this item?',
    fields: ['effect_type', 'affected_stat', 'bonus'],
    conditional: {
      field: 'effect_type',
      value: ['dam', 'hit', 'ac', 'stat']
    }
  }

  Prompt.register('item_creation', itemCreationFields);

  var roomCreationFields = [];

  roomCreationFields['zid'] = {
    name: 'zid',
    type: 'value',
    value: '',
  }

  roomCreationFields['name'] = {
    name: 'name',
    type: 'text',
    title: 'Enter room name. (This is displayed at the top of the room description)'
  }

  roomCreationFields['description'] = {
    name: 'description',
    type: 'multitext',
    title: 'Enter full room description. (This is displayed whenever a player enters the room)'
  }

  roomCreationFields['flags'] = {
    name: 'flags',
    type: 'multiselect',
    title: 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)',
    options: {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'}
  }

  roomCreationFields['inventory'] = {
    name: 'inventory',
    type: 'value',
    value: []
  }

  Prompt.register('room_creation', roomCreationFields);

  var zoneCreationFields = [];

  zoneCreationFields['name'] = {
    name: 'name',
    type: 'text',
    title: 'Enter zone name:',
  }

  zoneCreationFields['description'] = {
    name: 'description',
    type: 'multitext',
    title: 'Describe this zone:'
  }

  zoneCreationFields['rating'] = {
    name: 'rating',
    type: 'select',
    title: 'How hard is this zone?',
    options: {
      0:'Unpopulated rooms, simple navigation, no threats.',
      1:'Unarmed mobs with less than 3 hp, straightforward navigation, no room effects or DTs',
      2:'Armed or unarmed mobs with low damage, less than 20 hp, straightforward navigation, no room effects or DTs',
      3:'Armed or unarmed mobs up to 200 hp, no or small spell effects, room effects unlikely, no DTs',
      4:'Armed or unarmed mobs up to 1000hp, mid-level spell effects on boss mobs, room effects rare, DTs very rare',
      5:'Armed or unarmed mobs up to 2000hp, mid-level spell effects on all caster mobs, room effects and DTs possible',
      6:'Soloable. Mobs up to 3k HP, mid-level spell effects common, high level spells likely on boss mobs, room effects and DTs likely',
      7:'Difficult and time consuming to solo. Mobs with 3k+ HP common, high level spell use common, awkward navigation, room effects and DTs likely',
      8:'Cannot be solod effectively, ocassionally kills entire groups. Mobs with 3k+ HP everywhere, high level spell use ubiquitous, awkward navigation, room effects and DTs guaranteed',
      9:'Cannot be solod at all, frequently kills full groups. Mob HP set to ludicrous levels, spell effects ubiquitous, mazy navigation, puzzles, and deadly room effects guaranteed',
     10:'Routinely kills full groups of high level characters with top end equipment. No trick is too dirty.',
    },
    sanitizeInput = function(input) {
      input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
      input = parseInt(input.toLowerCase());
      return input;
    },
    saveRawInput: true,
  }

  zoneCreationFields['tic_interval'] = {
    name: 'tic_interval',
    type: 'int',
    title: 'How frequently (in seconds) should this zone refresh? (ex. 3600 = 1 hour)'
  }

  Prompt.register('zone_creation');

  var mobileCreationFields = [];

  mobileCreationFields['zid' = {
    name: 'zid',
    type: 'value',
    valye: '',
  }

  mobileCreationFields['name'] = {
    name: 'name',
    type: 'text',
    title: 'What should this mobile be named? (Name displays in room.)'
  }

  mobileCreationFields['short_name'] = {
    name: 'short_name',
    type: 'text',
    title: 'Provide a short name: (Displays during move, by "scan", etc.)'
  }

  mobileCreationFields['description'] = {
    name: 'description',
    type: 'multitext',
    title: 'Describe this mobile. (Description displayed by "look" command'
  }

  mobileCreationFields['hp'] = {
    name: 'hp',
    type: 'int',
    title: 'How many hitpoints does this mob have?',
  }
  // TODO: this should be altered into existence as needed by world mechanics module
  mobileCreationFields['mana'] = {
    name: 'mana',
    type: 'int',
    title: 'How many mana points does this mob have?'
  }

  mobileCreationFields['level'] = {
    name: 'level',
    type: 'int',
    title: 'What level is this mob?'
  }

  mobileCreationFields['hit'] = {
    name: 'hit',
    type: 'int',
    title: 'To hit bonus:'
  }

  mobileCreationFields['dam'] = {
    name: 'dam',
    type: 'int',
    title: 'Damage bonus:'
  }

  // TODO: flags field and options should be defined by world mechanics module
  mobileCreationFields['flags'] = {
    name: 'flags',
    type: 'multiselect',
    title: 'What additional flags should this mob have?',
    options: {n:'NONE', c:'CASTER', p:'PATROL', s:'SKILLED', a:'AGGRO', z:'ZONEHUNTER', w:'WORLDHUNTER'}
  }
  // Placeholder until spells/skills are a thing
  mobileCreationFields['effects'] = {
    name: 'effects',
    type: 'value',
    value: JSON.stringify([])
  }
  // Note: extra is a placeholder for any additional data required by complex mobprogs.
  mobileCreationFields['extra'] = {
    name: 'extra',
    type: 'value',
    value: JSON.stringify([])
  }

  Prompt.register('mobile_creation', mobileCreationFields);
}

/**
 * Item creation screen.
 *
 * @param session
 *   Character session object.
 */
module.exports.createItem = function(session) {
  var roomId = session.character.current_room;
  var zid = Rooms.room[roomId].zid;

  Prompt.start('item_creation', session);
}

/**
 * Room creation prompt.
 */
module.exports.createRoom = function(session) {

  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  Prompt.start('room_creation', session);
}

/**
 * Zone creation prompt.
 */
module.exports.createZone = function(session) {
  Prompt.start('zone_creation', session);
}

/**
 * Mobile type creation screen.
 *
 * @param session
 *   Player session object.
 *
 */
module.exports.createMobile = function(session) {
  Prompt.start('mobile_creation', mobileCreationFields);
}
