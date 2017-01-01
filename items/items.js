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
  th: 'TWO-HANDED'
}

item.prototype.loadItem = function(socket, itemId, callback, args) {
    var sql = "SELECT * FROM ?? WHERE ?? = ?";
    var inserts = ['items',  'iid', itemId];
    sql = global.mysql.format(sql, inserts);
    global.dbPool.query(sql, function(err, results, fields) {
      if (callball !== false) {
        callback(socket, results);
      }
    });
    // TODO: if container load inventory
}

item.prototype.createItem = function(socket) {

  var itemPrompt = global.prompt.new(socket, this.saveItem);
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
  // TODO: set container max weight, max item count
  // TODO: set item weight, size
  return properties;
}

item.prototype.saveItem = function(socket, fieldValues, callback, callbackArgs) {
  console.log('fieldValues in item save');
  console.log(fieldValues);

  var properties = {};
  var values = {
    name:fieldValues.name,
    room_description:fieldValues.room_description,
    full_description:fieldValues.full_description,
    properties: JSON.stringify(global.items.setItemProperties(fieldValues))
  }
  if (fieldValues.create === 'y') {
    callback = global.items.saveItemInstance;
    callbackArgs = false;
  }
  global.dbPool.query('INSERT INTO items SET ?', values, function (error, results) {
    socket.playerSession.write('Room saved.');
    socket.playerSession.inputContext = 'command';
    if (typeof callback === 'function') {
      callback(socket, results.insertId, callbackArgs);
    }
  });
}




item.prototype.saveItemInstance = function(socket, itemId, callback, callbackArgs) {
  // TODO: this is where the TWEAK happens.
  var properties = {};
  values = {
    iid:itemId,
    properties: JSON.stringify()
  }
  global.dbPool.query('INSERT INTO item_instance SET ?', values, function (error, results) {
    socket.playerSession.write('Item created.');
    var fieldValues = {
      containerId: socket.playerSession.character.inventory.id,
      instanceId:results.insertId
    }
    global.items.saveItemToInventory(socket, fieldValues, callback, callbackArgs);
  });
}

item.prototype.saveItemToInventory = function(socket, fieldValues, callback, callbackArgs) {
  var values = {
    cid:fieldValues.containerId,
    instance_id:fieldValues.instanceId
  }
  global.dbPool.query('INSERT INTO container_inventory SET ?', values, function (error, results) {
    socket.playerSession.write('Item created.');
    if (typeof callback === 'function') {
      callback(socket, results.insertId, callbackArgs);
    }
  });
}

item.prototype.transferItemInstance = function(socket, fieldValues, callback, callbackArgs) {
  // Inventory alterations to containers, rooms, and players must be syncronous to prevent
  // race conditions and item duping.
  switch (fieldValues.transferType) {
    case 'character-to-room':
      // get current room id
      var roomId = socket.playerSession.character.currentRoom;
      // delete inventory[index] from character inventory
      delete socket.playerSession.character.inventory[fieldValues.index];
      // add item to room[room id].inventory
      global.rooms.room[roomId].inventory.push(fieldValues.item);
      break;

    case 'room-to-character':
      var roomId = socket.playerSession.character.currentRoom;
      // delete inventory[index] from character inventory
      delete global.rooms.room[roomId].inventory[fieldValues.index];
      // add item to room[room id].inventory
      socket.playerSession.character.inventory.push(fieldValues.item);
      break;

    case 'character-to-character':

      break;

    case 'room-to-room':

      break;

    case 'container-to-character':

      break;

    case 'character-to-container':
      delete socket.playerSession.character.inventory[fieldValues.index];
      if (fieldValues.containerLocation === 'character inventory') {

      }

      break;

    default:
      break;
  }
}

item.prototype.loadInventory = function(socket, fieldValues) {
  var inserts = [fieldValues.containerType, fieldValues.parentId];
  var sql = `
    SELECT
      ii.instance_id,
      i.name,
      i.room_description,
      i.full_description,
      i.properties
    FROM item_instance ii
    INNER JOIN items i
      ON i.iid = ii.iid
    INNER JOIN container_inventory ci
      ON ci.instance_id = ii.instance_id
    INNER JOIN containers c
      ON c.cid = ci.cid
    WHERE
      container_type = ?
      AND parent_id = ?`;

  sql = global.mysql.format(sql, inserts);

  global.dbPool.query(sql, function(err, results, fields) {
    switch(fieldValues.containerType) {
      case 'player_inventory':
        socket.playerSession.character.inventory = results;
        break;
      case 'room_inventory':
        global.rooms.room[fieldValues.parentId].inventory = results;
        break;
      default:
        break;
    }
    if (typeof callback === 'function') {
      callback(socket, '');
    }
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

item.prototype.inventoryDisplay = function(socket, inventory) {
  if (inventory.length === 0) {
   return '';
  }
  var output = '';
  for (i = 0; i < inventory.length; ++i) {
    if (typeof inventory[i] === 'object') {
      output += inventory[i].name + "\n";
    }
  }
  return output;
}

item.prototype.searchInventory = function(input, field, inventory, like) {

  for (i = 0; i < inventory.length; ++i) {
    item = inventory[i];
    if (like === true) {
      if (item[field].includes(input)  === true) {
        return i;
      }
    }
    else {
      if (item[field] === input) {
        return i;
      }
    }
  }
  return false;
}

/**
 * Provide a list of worn equipment.
 *
 *  - Used by eq command to display character equipment
 *  - Used by look command to display mob/character equipment
 */
item.prototype.equipmentDisplay = function(socket, equipment) {
  // Empty slot display:
  // (head): - empty
  //
  // Equipped slot display:
  // (head): - The enamel chin of Rolph
}

module.exports = new item();
