/**
 * @file container class and associated methods for handling items.
 */

var Events = require('events');

var item = function(){
  // Modules may register listeners to this event to act when
  // items are loaded.
  this.event = new Events.EventEmitter();
};

// TODO: move flag definitions out of here and make them overrideable and bundled with effect callbacks or similar.
item.prototype.flags = {
    0:  'NONE',
    c:  'CONTAINER',
    i:  'INVISIBLE',
    pi: 'PLAYERINVISIBLE',
    we: 'WEARABLE',
    u:  'CURSE',
    b:  'BLESS',
    h:  'HUM',
    ta: 'TAKE',
    wi: 'WIELD',
    h:  'HOLD',
    th: 'TWO-HANDED',
    po: 'PORTAL',
    li: 'LIGHT',
    nta: '!TAKE'
}

/**
 * Apply stat changes based on item effects.
 *
 * @param recipient
 *   Character or mobile object to apply stat changes to.
 *
 * @param item
 *   Item object we are checking for effects.
 *
 */
item.prototype.applyEffects = function(recipient, item) {
  var effects = item.properties.effects;
  for (var i = 0; i < effects.length; ++i) {
    var effect = effects[i];
    recipient.stats[effect.affectedStat] += parseInt(effect.bonus);
  }
}

/**
 * Remove item effects from mobile or character.
 *
 * Typically executed when equipment is removed.
 *
 * @param recipient
 *   Character or mobile object to remove stat changes from.
 *
 * @param item
 *   Item object we are checking for effects.
 */
item.prototype.removeEffects = function(recipient, item) {
  var effects = item.properties.effects;
  for (var i = 0; i < effects.length; ++i) {
    var effect = effects[i];
    if (effect.effectType === 'stat') {
      recipient.stats[effect.affectedStat] -= parseInt(effect.bonus);
    }
    else {
      recipient.stats[effect.effectType] -= parseInt(effect.bonus);
    }
  }
}

/**
 * Item creation screen.
 *
 * @param session
 *   Character session object.
 */
item.prototype.createItem = function(session) {
  var roomId = session.character.current_room;
  var zid = Rooms.room[roomId].zid;

  var itemPrompt = Prompt.new(session, this.saveNewItem);

  // Item definitions are tied to a specific zone to make life easier
  // when equipping mobiles. Having zid in this table makes listing
  // items associated with the zone trivial.

  var zidField = itemPrompt.newField('value');
  zidField.name = 'zid';
  zidField.value = zid;
  itemPrompt.addField(zidField);

  var nameField = itemPrompt.newField('text');
  nameField.name = 'name';
  nameField.inputCacheName = 'name';
  nameField.formatPrompt('What do you want to name it? Note the name is what is displayed in personal inventory or when equipped.');
  itemPrompt.addField(nameField);

  var roomDescriptionField = itemPrompt.newField('text');
  roomDescriptionField.name = 'room_description';
  roomDescriptionField.formatPrompt('Provide a short description of the item that will be shown when it is sitting out in a room.');
  itemPrompt.addField(roomDescriptionField);

  var fullDescriptionField = itemPrompt.newField('multitext');
  fullDescriptionField.name = 'full_description';
  fullDescriptionField.formatPrompt('Provide a thorough description. This is what will be displayed if this item is examined.');
  itemPrompt.addField(fullDescriptionField);

  // Required to drive item scarcity if it is enabled.
  if (typeof Config.itemScarcity !== 'undefined' && Config.itemScarcity === true) {
    var maxCountField = itemPrompt.newField('int');
    maxCountField.name = 'max_count';
    maxCountField.formatPrompt('How many of this item can exist in the world at one time? (-1 for unlimited)');
    itemPrompt.addField(maxCountField);

    var loadChanceField = itemPrompt.newField('int');
    loadChanceField.name = 'load_chance';
    loadChanceField.maxint = 100;
    loadChanceField.formatPrompt('What are is % chance of this item loading on respawn? (100 for always)');
    itemPrompt.addField(loadChanceField);
  }

  var flagsField = itemPrompt.newField('multiselect');
  flagsField.name = 'flags';
  flagsField.options = Items.flags;
  flagsField.formatPrompt('Select one or more flags to assign to this item');
  itemPrompt.addField(flagsField);

  // Conditional fields

  // PORTAL destination room id
  var portalDestinationField = itemPrompt.newField('int');
  portalDestinationField.name = 'target_rid',
  portalDestinationField.conditional = {
    field: 'flags',
    value: 'PORTAL',
  }
  portalDestinationField.formatPrompt('Enter numeric room id this portal should lead to.');
  itemPrompt.addField(portalDestinationField);

  // container size
  var containerSizeField = itemPrompt.newField('int');
  containerSizeField.name = 'containerSize';
  containerSizeField.conditional = {
    field: 'flags',
    value: 'CONTAINER'
  };
  containerSizeField.formatPrompt('Enter container size as a number.');
  itemPrompt.addField(containerSizeField);

  // Wear slot
  var wearSlotField = itemPrompt.newField('select');
  wearSlotField.name = 'equipment_slot';
  wearSlotField.options = Config.equipmentSlots;
  wearSlotField.conditional = {
    field: 'flags',
    value: 'WEARABLE',
  }
  wearSlotField.formatPrompt('Where can this be worn?');
  itemPrompt.addField(wearSlotField);

  // Wield fields
  // base damage dice
  var damageDiceField = itemPrompt.newField('dice');
  damageDiceField.name = 'damage_dice';
  damageDiceField.formatPrompt('Weapon base damage dice');
  damageDiceField.conditional = {
    field: 'flags',
    value: 'WIELD',
  }
  itemPrompt.addField(damageDiceField);
   // TODO: spell affect
      // spell
      // percentage fire
      // strength ??
    // additional effects
  var selectEffectField = itemPrompt.newField('select');
  selectEffectField.name = 'effectType';
  selectEffectField.options = {d:'dam', h:'hit', a:'ac', s:'stat'};
  selectEffectField.formatPrompt('What additional effects does this equipment have?');
  selectEffectField.conditional = {
    field: 'flags',
    value: ['WIELD', 'HOLD', 'WEARABLE']
  }
  itemPrompt.addField(selectEffectField);

  var statField = itemPrompt.newField('select');
  statField.name = 'affectedStat';
  statField.options = {i:'int', w:'wis', ch:'cha', s:'str', co:'con', d:'dex'};
  statField.formatPrompt('Select a stat to buff');
  statField.conditional = {
    field: 'effectType',
    value: 'stat',
  }
  itemPrompt.addField(statField);

  var bonusField = itemPrompt.newField('int');
  bonusField.name = 'bonus';
  bonusField.formatPrompt('Effect bonus (positive or negative numbers only)');
  bonusField.conditional = {
    field: 'effectType',
    value: ['dam', 'hit', 'ac', 'stat']
  }
  itemPrompt.addField(bonusField);
  // bonus reiteration handled by fieldGroup processing code. No need to add
  // additional prompt logic here.
  var bonusFieldGroup = itemPrompt.newField('fieldgroup');
  bonusFieldGroup.name = 'effects',
  bonusFieldGroup.fields = ['effectType', 'affectedStat', 'bonus'],
  bonusFieldGroup.formatPrompt('Do you wish to add another effect to this item?');
  bonusFieldGroup.conditional = {
    field: 'effectType',
    value: ['dam', 'hit', 'ac', 'stat']
  }
  itemPrompt.addField(bonusFieldGroup);

  itemPrompt.start();
}

/**
 * Build item properties from user input.
 *
 * @param fieldValues
 *   User input from item creation screen.
 *
 * @return
 *   Returns formatted item properties object.
 */
item.prototype.setItemProperties = function(fieldValues) {
  var properties = {
    flags: fieldValues.flags,
    effects: fieldValues.effects,
    max_count: fieldValues.max_count,
    load_chance: fieldValues.load_chance,
    equipment_slot: fieldValues.equipment_slot,
    damage_dice: fieldValues.damage_dice,
  };
  return properties;
}

/**
 * Completion callback for item creation screen.
 *
 * @param session
 *   Player session object.
 *
 * @param fieldValues
 *   User input values from item creation screen.
 */
item.prototype.saveNewItem = function(session, fieldValues) {
  var roomId = session.character.current_room;
  var zid = Rooms.room[roomId].zid;
  // Whatever happens next the prompt that got us here has
  // completed so we need to switch input context to escape the
  // prompt system
  // TODO: update prompt system to render this unnecessary.
  session.inputContext = 'command';
  var properties = {};
  var values = {
    zid: zid,
    name:fieldValues.name,
    room_description:fieldValues.room_description,
    full_description:fieldValues.full_description,
    properties: JSON.stringify(Items.setItemProperties(fieldValues))
  }
  var Item = Models.Item;

  Item.create(values).then(function(newItem) {
    session.write('New item type saved.');
  }).catch(function(error) {
    console.log('Something has gone wrong saving an item:' + error);
  });
}


/**
 * Provides a list of the content of an inventory.
 *
 * Since this is used in multiple places the inventory in question has to
 * be passed explicitly instead of merely assuming that the current character
 * inventory is the target.
 *
 * -  Used by inv command to display character inventory contents
 * -  Used by look command to display items in room
 * -  Used by exam command to display contents of a container
 * -  Used by glance skill to display contents of mob/character inventory
 */

item.prototype.inventoryDisplay = function(inventory, room, showEmptySlots) {
  var output = '';
  if (Array.isArray(inventory) === true) {
    var numericKeys = true;
    var length = inventory.length;
  }
  else {
    var numericKeys = false;
    var keys = Object.keys(inventory);
    var length = keys.length;
  }
  for (var i = 0; i < length; ++i) {
    if (numericKeys) {
      item = inventory[i];
    }
    else {
      item = inventory[keys[i]];
    }
    if (typeof item === 'object') {
      if (numericKeys === false) {
        console.log('key:' + keys[i]);
        switch (keys[i]) {
          case 'WIELD':
            output += '%cyan%<weapon wielded>%cyan% ';
            break;
          case 'HOLD':
            output += '%cyan%<item held>%cyan% ';
            break;
          default:
            output += '%cyan%<worn on ' + keys[i].toLowerCase() + '>%cyan% ';
            break;
        }
      }
      if (room) {
        output += item.room_description;
      }
      else {
        output += item.name + "\n";
      }
    }
    else if (item === false && numericKeys === false && showEmptySlots) {
      output += '%cyan%<worn on ' + keys[i] + '>%cyan%  nothing\n';
      switch (keys[i]) {
          case 'WIELD':
            output += '%cyan%<weapon wielded>%cyan% <empty>';
            break;
          case 'HOLD':
            output += '%cyan%<item held>%cyan% <empty>';
            break;
          default:
            output += '%cyan%<worn on ' + keys[i].toLowerCase() + '>%cyan% <empty>';
            break;
      }

    }
  }
  return output;
}

/**
 * Generate an instance of a given item type and place it in game.
 *
 * @param iid
 *   Item id.
 *
 * @param destination
 *   Inventory (room, character, or mobile) to add item to.
 *
 * @param key
 *   Optional, defines a key position in inventory to add the item to.
 *   Note: this is currently only used when equipping mobs.
 *
 */
item.prototype.generateItemInstance = function(iid, destination, key) {
  var Item = Models.Item;
  Item.findOne({where:{iid:iid}}).then(function(instance) {
    var generatedItem = instance.dataValues;
    generatedItem.properties = JSON.parse(generatedItem.properties);
    Items.event.emit('itemCreated', generatedItem);
    destination[key] = generatedItem;
  });
}

/**
 * Search an inventory for an item.
 *
 * @param input
 *   Search term
 *
 * @param field
 *   Item field name to search for a match (typically name).
 *
 * @param inventory
 *   Inventory to search
 *
 * @param like
 *   Boolean, if true search will look for partial matches on the search term.
 *   Otherwise === is used to test for matches.
 *
 * @return
 *   If inventory is an array, returns the numeric index of the found item in inventory.
 *   If inventory is an object, returns the object key pointing to the found item.
 *   If no matches are found returns false.
 */
item.prototype.findItemInContainer = function(input, field, inventory, like) {
    var foundIndex = false;
    // Standard container inventories are arrays.
    if (Array.isArray(inventory)) {
      var numericKeys = true;
      var length = inventory.length
    }
    // Player equipment inventories are objects keyed by eq slot.
    else {
      var numericKeys = false;
      var keys = Object.keys(inventory);
      var length = keys.length;
    }

    for (var i = 0; i < length; ++i) {
      if (numericKeys) {
        item = inventory[i];
      }
      else {
        item = inventory[keys[i]];
      }
      // Player equipment inventories frequently have empty slots which should be skipped.
      if (item === false) {
        continue;
      }
      // Weird things happen after a drop command has been executed but before
      if (like === true) {
        if (item[field].includes(input) === true) {
          foundIndex = i;
          break;
        }
      }
      else {
        if (item[field] === input) {
          foundIndex = i;
        }
      }
    }
    if (numericKeys) {
      return foundIndex;
    }
    else {
      return keys[foundIndex];
    }
}

/**
 * Move an item from one inventory to another.
 *
 * @param session
 *   Player session object.
 *
 * @param transferDetails
 *   Object containing the following keys:
 *
 *    item: The item object to transfer.
 *    transferType: The type of transfer being performed.
 *
 */
item.prototype.transferItemInstance = function(session, transferDetails) {
    // Note: inventory alterations to containers, rooms, and players must be syncronous to prevent
    // race conditions and item duping.
    var item = transferDetails.item;
    Items.event.emit('itemMove', session, item, transferDetails.transferType);
    switch (transferDetails.transferType) {
      // "drop" command
      case 'character-to-room':
        var roomId = session.character.current_room;
        // delete inventory[index] from character inventory
        session.character.inventory.splice(transferDetails.index, 1);
        Items.removeEffects(session.character, transferDetails.item);
        // add item to room[room id].inventory
        Rooms.room[roomId].inventory.push(transferDetails.item);
        break;
      // "get" command
      case 'room-to-character':
        var roomId = session.character.current_room;
        // delete inventory[index] from room inventory
        Rooms.room[roomId].inventory.splice(transferDetails.index, 1);
        // add item to room[room id].inventory
        session.character.inventory.push(transferDetails.item);
        Items.applyEffects(session.character, transferDetails.item);
        break;
      // "give" command
      case 'character-to-character':

        break;
      // ???
      case 'room-to-room':

        break;
      // "get <item> from <container>" command
      case 'container-to-character':

        break;
      // "put <item> in <container>" command
      case 'character-to-container':
       // delete session.character.inventory[transferDetails.index];
       // if (transferDetails.containerLocation === 'character inventory') {

       // }
        break;
      // wear command
      case 'character-to-equipped':
        console.log(transferDetails.item.properties);
        var equipmentSlot = transferDetails.item.properties.equipmentSlot;
        console.log('equipment slot:' + equipmentSlot);
        if (typeof session.character.equipment[equipmentSlot] !== false) {
          // transfer equipment already in this slot to inventory
          // if transfer fails due to flag effects (CURSE) halt transfer and show message.
        }
        session.character.inventory.splice(transferDetails.index, 1);
        session.character.equipment[equipmentSlot] = transferDetails.item;
        break;
      // remove command
      case 'equipped-to-character':
        var equipmentSlot = transferDetails.item.properties.equipmentSlot;
        session.character.equipment[equipmentSlot] = false;
        console.log(transferDetails);
        session.character.inventory.push(transferDetails.item);
        break;
      default:
        break;
    }
}

module.exports = new item();
