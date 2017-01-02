var item = function(){};

// TODO: refactor this mess. Item types should be a single list.

item.prototype.listTypes = function() {
  var list = ['weapon','equipment','misc','container','food'];
  return list;
}

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

item.prototype.loadItem = function(itemId) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM ?? WHERE ?? = ?";
    var inserts = ['items',  'iid', itemId];
    sql = global.mysql.format(sql, inserts);
    global.dbPool.query(sql, function(error, results, fields) {
      if (error) {
        return reject(error);
      }
      else {
        var item = results[0];
        // TODO: if container load inventory
        return resolve(item);
      }
    });
  });
}

item.prototype.createItem = function(session) {

  var itemPrompt = global.prompt.new(session, this.saveNewItem);
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
  flagsField.options = global.items.flags;
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
  wearSlotField.options = global.config.equipmentSlots;
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
  selectEffectField.name = 'effects';
  selectEffectField.options = {d:'dam', h:'hit', a:'ac', s:'stat'};
  selectEffectField.formatPrompt('What additional effects does this equipment have?');
  selectEffectField.conditional = {
    field: 'flags',
    value: ['WIELD', 'HOLD', 'WEARABLE']
  }
  selectEffectField.fieldGroup = 'effects';
  itemPrompt.addField(selectEffectField);

  var statField = itemPrompt.newField('select');
  statField.name = 'effectedStat';
  statField.options = {i:'int', w:'wis', ch:'cha', s:'str', co:'con', d:'dex'};
  statField.formatPrompt('Select a stat to buff');
  statField.conditional = {
    field: 'effects',
    value: 'stat',
  }
  statField.fieldGroup = 'effects';
  itemPrompt.addField(statField);

  var bonusField = itemPrompt.newField('int');
  bonusField.name = 'bonus';
  bonusField.formatPrompt('Effect bonus (positive or negative numbers only)');
  bonusField.conditional = {
    field: 'effects',
    value: ['dam', 'hit', 'ac', 'stat']
  }
  bonusField.fieldGroup = 'effects';
  itemPrompt.addField(bonusField);
  // bonus reiteration handled by fieldGroup processing code. No need to add
  // additional prompt logic here.

  var createItemField = itemPrompt.newField('select');
  createItemField.name = 'create',
  createItemField.options = {y:'y', n:'n'},
  createItemField.formatPrompt(':: [::y::]es or [::n::]o ::', true);
  itemPrompt.addField(createItemField);

  itemPrompt.start();
}

item.prototype.setItemProperties = function(fieldValues) {
  var properties = {};
  properties.flags = fieldValues.flags.join(',');
  return properties;
}

item.prototype.saveNewItem = function(session, fieldValues) {
  var properties = {};
  var values = {
    name:fieldValues.name,
    room_description:fieldValues.room_description,
    full_description:fieldValues.full_description,
    properties: JSON.stringify(global.items.setItemProperties(fieldValues))
  }
  global.items.saveItem(values).then((response) => {
    if (fieldValues.create === 'y') {
      values = {
        iid:response.iid,
        properties: response.properties
      }
      global.items.saveItemInstance(values).then((response) => {
        var values = {
          cid: session.character.inventory.id,
          instance_id: response.instance_id
        }
        global.items.saveItemToInventory(values).then((response) => {
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

item.prototype.saveItem = function(values) {
  return new Promise((resolve, reject) => {
    global.dbPool.query('INSERT INTO items SET ?', values, function (error, results) {
      if (error) {
        return reject(error);
      }
      else {
        session.write('Room saved.');
        session.inputContext = 'command';
        values.iid = results.insertId;
        return resolve(values);
      }
    });
  });
}

item.prototype.saveItemInstance = function(item) {
  return new Promise((resolve, reject) => {
    // TODO: this is where the TWEAK happens.
      // unpack properties
      // tweak
      // restringify properties

    global.dbPool.query('INSERT INTO item_instance SET ?', values, function (error, results) {
      if (error) {
        return reject(error);
      }
      else {
        values.instance_id = results.insertId;
        return resolve(values);
      }
    });
  });
}

item.prototype.saveItemToInventory = function(values) {
  return new Promise((resolve, reject) => {
    global.dbPool.query('INSERT INTO container_inventory SET ?', values, function (error, results) {
      if (error) {
        return reject(error);
      }
      else {
        values.id = response.insertId;
        return resolve(values);
      }
    });
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
  for (i = 0; i < inventory.length; ++i) {
    if (typeof inventory[i] === 'object') {
      output += inventory[i].name + "\n";
    }
  }
  return output;
}


/**
 * Provide a list of worn equipment.
 *
 *  - Used by eq command to display character equipment
 *  - Used by look command to display mob/character equipment
 */
item.prototype.equipmentDisplay = function(session, equipment) {
  // Empty slot display:
  // (head): - empty
  //
  // Equipped slot display:
  // (head): - The enamel chin of Rolph
}

module.exports = new item();
