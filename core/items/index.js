var item = function(){};

// TODO: replace with flag objects that include effect callbacks?
item.prototype.flags = {
  0:  'NONE',
  c:  'CONTAINER',
  i:  'INVISIBLE',
  pi: 'PLAYERINVISIBLE',
  we: 'WEARABLE',
  u:  'CURSE',
  b:  'BLESS',
  h:  'HUM',
  t:  'TAKE',
  wi: 'WIELD',
  h:  'HOLD',
  th: 'TWO-HANDED',
  po: 'PORTAL',
}

item.prototype.applyEffects = function(session, item) {
  effects = item.properties.effects;
  // TODO: apply effect
}


item.prototype.createItem = function(session) {

  var itemPrompt = Prompt.new(session, this.saveNewItem);
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
  wearSlotField.name = 'equipmentSlot';
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
  damageDiceField.name = 'damageDice';
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

  var createItemField = itemPrompt.newField('select');
  createItemField.name = 'create',
  createItemField.options = {y:'Yes', n:'No'},
  createItemField.formatPrompt('Create an instance of this item?');
  itemPrompt.addField(createItemField);

  itemPrompt.start();
}

item.prototype.setItemProperties = function(fieldValues) {
  var properties = fieldValues;
  properties.flags = fieldValues.flags.join(',');
  return properties;
}

item.prototype.saveNewItem = function(session, fieldValues) {
  // Whatever happens next the prompt that got us here has
  // completed so we need to switch input context to escape the
  // prompt system
  session.inputContext = 'command';
  var properties = {};
  var values = {
    name:fieldValues.name,
    room_description:fieldValues.room_description,
    full_description:fieldValues.full_description,
    properties: JSON.stringify(Items.setItemProperties(fieldValues))
  }
  var Item = Models.Item;

  Items.create(values).then(function(newItem) {
    session.write('New item type saved.');
    if (fieldValues.create === 'Yes') {
      var values = {
        iid:newItemInstance.get('iid'),
        properties: newItemInstance.get('.properties')
      }
      var ItemInstance = Models.ItemInstance;
      ItemInstance.create(values).then((newItemInstance) => {
        session.write('New instance of item saved.');
        var values = {
          cid: session.character.inventory.id,
          instance_id: newItemInstance.get('instance_id')
        }
        var ContainerInventory = Models.ContainerInventory;
        ContainerInventory.create(values).then((newContainerInventory) => {
          session.write('New item created. Check your inventory.');
        }).catch(function(error) {
          console.log('something has gone wrong adding a new item to inventory:' + error);
        });
      }).catch(function(error) {
        console.log('something has gone wrong saving a new item instance:' + error);
      });
    }
  }).catch(function(error) {
    console.log('something has gone wrong saving an item:' + error);
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

item.prototype.inventoryDisplay = function(inventory) {
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
        output += '%cyan%<worn on ' + keys[i] + '>%cyan% '
      }
      output += item.name + "\n";
    }
    else if (item === false && numericKeys === false) {
      output += '%cyan%<worn on ' + keys[i] + '>%cyan%  nothing\n';
    }
  }
  return output;
}

module.exports = new item();
