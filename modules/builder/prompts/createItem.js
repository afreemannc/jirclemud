function itemCreationPrompt() {
  this.id = 'item_creation'
  this.completionCallback = Items.saveItem,
  this.quittable = true,
  this.fields = {
    'zid': {
      name: 'zid',
      type: 'value',
      value: '',
    }
    'name': {
      name: 'name',
      type: 'text',
      title: 'What do you want to name it? Note the name is what is displayed in personal inventory or when equipped.'
    }
    'room_description': {
      name: 'room_description',
      type: 'text',
      title: 'Provide a short description of the item that will be shown when it is sitting out in a room.'
    }
    'full_description': {
      name: 'full_description',
      type: 'multitext',
      title: 'Provide a thorough description. This is what will be displayed if this item is examined.'
    }
   'flags': {
      name: 'flags',
      type: 'multiselect',
      title: 'Select one or more flags to assign to this item:
      options: Item.flags
    }
    'target_rid': {
      name: 'target_rid',
      type: 'int',
      title: 'Enter numeric room id this portal should lead to:',
      conditional: {
        field: 'flags',
        value: 'PORTAL'
      }
    }
    'container_size': {
      name: 'container_size',
      type: 'int',
      title: 'Enter container size as a number:',
      conditional: {
        field: 'flags',
        value: 'CONTAINER'
      }
    }
    'equipment_slot': {
      name: 'equipment_slot',
      type: 'select',
      title: 'Where can this be worn?',
      options: Config.equipmentSlots,
      conditional: {
        field: 'flags',
        value: 'WEARABLE'
      }
    }
    'damage_dice': {
      name: 'damage_dice',
      type: 'dice',
      title: 'Weapon base damage dice:',
      conditional: {
        field: 'flags',
        value: 'WIELD'
      }
    }
    'effect_type': {
      name: 'effect_type',
      type: 'select',
      title: 'What additional effects does this equipment have?',
      options: {d:'dam', h:'hit', a:'ac', s:'stat'},
      conditional: {
        field: 'flags',
        value: ['WIELD', 'HOLD', 'WEARABLE']
      }
    }
    'affected_stat': {
      name: 'affected_stat',
      type: 'select',
      title: 'Select a stat to buff:',
      options: {i:'int', w:'wis', ch:'cha', s:'str', co:'con', d:'dex'} // TODO: move to world mechanics module
      conditional: {
        field: 'effect_type',
        value: 'stat'
      }
    }
    'bonus': {
      name: 'bonus',
      type: 'int',
      title: 'Effect bonus (positive or negative numbers only):'
      conditional: {
        field: 'effect_type',
        value: 'stat'
      }
    }
    'effects': {
      name: 'effects',
      tyoe: 'fieldgroup',
      title: 'Do you wish to add another effect to this item?',
      fields: ['effect_type', 'affected_stat', 'bonus'],
      conditional: {
        field: 'effect_type',
        value: ['dam', 'hit', 'ac', 'stat']
      }
    }
  };

  if (typeof Config.itemScarcity !== 'undefined' && Config.itemScarcity === true) {
    this.fields['max_count'] = {
      name: 'max_count',
      type: 'int',
      title: 'How many of this item can exist in the world at one time? (-1 for unlimited)'
    }
    this.fields['load_chance'] = {
      name: 'load_chance',
      type: 'int',
      title: '% chance this item will load on zone respawn (100 for always)',
      maxint: 100
    }
  }
}
