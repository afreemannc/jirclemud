var item = function(){};

// TODO: refactor this mess. Item types should be a single list.

item.prototype.listTypes = function() {
  var list = ['weapon','equipment','misc','container','food'];
  return list;
}

// TODO: rename select option and/or label to more descriptive term
item.prototype.weapon = {
  name: 'Weapon',
  type: 'weapon',
  selectOption: 'w',
  label: '[::w::]eapon',
  description: 'Make things dead.'
}

item.prototype.equipment = {
  name: 'Equipment',
  type: 'equipment',
  selectOption: 'e',
  label: '[::e::]quipment',
  description: 'Wear it.'
}

item.prototype.misc = {
  name: 'Misc',
  type: 'misc',
  label: '[::m::]isc',
  selectOption: 'm',
  description: 'Random junk.'
}

item.prototype.container = {
  name: 'Container',
  type: 'container',
  label: '[::c::]ontainer',
  selectOption: 'c',
  description: 'Put stuff in it.'
}

item.prototype.food = {
  name: 'Food',
  type: 'food',
  selectOption: 'f',
  label: '[::f::]ood',
  description: 'Eat it.'
}

item.prototype.flags = {
  'NONE': {
    selectOption: '0',
    properties: {}
  },

  'CONTAINER': {
    selectOption: '1',
    properties: {
      max_item_count: 'int',
      max_weight: 'int'
    }
  },

  'WEARABLE': {
    selectOption: '2',
    properties: {
      eq_slot: 'select',
      options: this.eqSlots
    }
  },

  'CURSE': {
    selectOption: '3',
    properties: {}
  },

  'BLESS': {
    selectOption: '4',
    properties: {}
  },

  'HUM': {
    selectOption: '5',
    properties: {}
  },

  'HOLD': {
    selectOptions: '6',
    properties: {}
  }
}

item.prototype.flagOptions = function() {
  var options = {};
  var flags = global.items.flags;
  var keys = Object.keys(flags);
  for (i = 0; i < keys.length; ++i) {
    options[flags[keys[i]].selectOption] = keys[i];
  }
  console.log('flag options:');
  console.log(options);
  return options;
}

item.prototype.flagsPrompt = function() {
  var promptMessage = 'What flags should this item have?\n';
  var flags = global.items.flags;
  var keys = Object.keys(flags);
  for (i = 0; i < keys.length; ++i) {
    promptMessage += '[::' + i + '::] ' + keys[i] + '\n';
  }
  console.log(promptMessage);
  return promptMessage;
}

item.prototype.eqSlots = {
  head: {1: 'head'},
  face: {2: 'face'},
  neck: {3: 'neck'},
  body: {4: 'body'},
  arms: {5: 'arms'},
  wrist: {6: 'wrist'},
  hands: {7: 'hands'},
  finger: {8: 'finger'},
  waist: {8: 'waist'},
  legs: {9: 'legs'},
  feet: {10: 'feet'}

}

item.prototype.loadItem = function(socket, itemId, callback, args) {
    var sql = "SELECT * FROM ?? WHERE ?? = ?";
    var inserts = ['items',  'iid', itemId];
    sql = global.mysql.format(sql, inserts);
    socket.connection.query(sql, function(err, results, fields) {
      if (callball !== false) {
        callback(socket, results);
      }
    });
}

item.prototype.createItem = function(socket) {

  var itemPrompt = global.prompt.new(socket, this.saveItem);
  var typeField = itemPrompt.newField();
  typeField.name = 'type';
  typeField.type = 'select';
  typeField.options = global.items.getTypeOptions();
  typeField.startField = true;
  typeField.inputCacheName = 'type';
  typeField.promptMessage = global.items.createMessage();
  itemPrompt.addField(typeField);

  // TODO: implement length limitation on text fields.
  var nameField = itemPrompt.newField();
  nameField.name = 'name',
  nameField.type = 'text',
  nameField.inputCacheName = 'name',
  nameField.promptMessage = 'What do you want to name it? Note the name is what is displayed in personal inventory or when equipped.',
  itemPrompt.addField(nameField);

  var roomDescriptionField = itemPrompt.newField();
  roomDescriptionField.name = 'room_description',
  roomDescriptionField.type = 'text',
  roomDescriptionField.inputCacheName = 'room_description',
  roomDescriptionField.promptMessage = 'Provide a short description of the item that will be shown when it is sitting out in a room.',
  itemPrompt.addField(roomDescriptionField);

  var fullDescriptionField = itemPrompt.newField();
  fullDescriptionField.name = 'full_description',
  fullDescriptionField.type = 'multi',
  fullDescriptionField.inputCacheName = 'full_description',
  fullDescriptionField.promptMessage = 'Provide a thorough description. This is what will be displayed if this item is examined.',
  itemPrompt.addField(fullDescriptionField);

  var flagsField = itemPrompt.newField();
  flagsField.name = 'flags';
  flagsField.type = 'multi-select';
  flagsField.options = global.items.flagOptions();
  flagsField.inputCacheName = 'flags';
  flagsField.promptMessage = global.items.flagsPrompt();
  itemPrompt.addField(flagsField);

  var createItemField = itemPrompt.newField();
  createItemField.name = 'create',
  createItemField.type = 'select',
  createItemField.options = {y:'y', n:'n'},
  createItemField.inputCacheName = 'create',
  createItemField.promptMessage = ':: [::y::]es or [::n::]o ::';
  itemPrompt.addField(createItemField);
  // TO DO: start working on properties
  // helper function should switch on type to build out valid additional fields
  // ex. weapon needs dam dice, container needs capacity (weight, size), etc

  itemPrompt.setActivePrompt(itemPrompt);
}

item.prototype.getTypeOptions = function() {
  var options = [];
  var itemTypes = global.items.listTypes();
  for (i = 0; i < itemTypes.length; ++i) {
    currentItem = global.items[itemTypes[i]];
    options[currentItem.selectOption] = currentItem.type;
  }
  console.log('options:');
  console.log(options);
  return options;
}

item.prototype.createMessage = function() {
  var itemTypes = global.items.listTypes();
  var prompt = 'What type of item would you like to create?\n';
  var item = {};
  for (i = 0; i < itemTypes.length; ++i) {
    console.log('thing:' + itemTypes[i]);
    console.log(global.items[itemTypes[i]]);
    currentItem = global.items[itemTypes[i]];
    console.log(currentItem);
    prompt += currentItem.label + ' :: ';
  }
  return prompt + '\n';
}

item.prototype.setItemProperties = function(fieldValues) {
  var properties = {};
  properties.flags = fieldValues.flags.join(',');
  // TODO: set container max weight, max item count
  // TODO: set item weight, size
  return properties;
}

item.prototype.saveItem = function(socket, fieldValues, callback, callbackArgs) {

  var properties = {};
  var values = {
    name:fieldValues.name,
    type:fieldValues.type,
    room_description:fieldValues.room_description,
    full_description:fieldValues.full_description,
    properties: JSON.stringify(global.items.setItemProperties(fieldValues))
  }
  if (fieldValues.create === 'y') {
    callback = global.items.saveItemInstance;
    callbackArgs = false;
  }
  socket.connection.query('INSERT INTO items SET ?', values, function (error, results) {
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
  socket.connection.query('INSERT INTO item_instance SET ?', values, function (error, results) {
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
  socket.connection.query('INSERT INTO container_inventory SET ?', values, function (error, results) {
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
      socket.playerSession.character.inventory.push(fieldValue.item);
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
  /*
  var sql = 'UPDATE container_inventory set cid = ? WHERE instance_id = ?';
  var inserts = [fieldValues.newCid, fieldValues.instanceId];
  socket.connection.query(sql, inserts, function(err, results, fields) {
  });
  */
}

item.prototype.loadInventory = function(socket, fieldValues, callback, callbackArgs) {
  console.log('loadInventory invoked');
  var inserts = [fieldValues.containerType, fieldValues.parentId];
  var sql = `
    SELECT
      ii.instance_id,
      i.name,
      i.type,
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

  socket.connection.query(sql, function(err, results, fields) {
    switch(fieldValues.containerType) {
      case 'player_inventory':
        socket.playerSession.character.inventory = results;
        break;
      case 'room_inventory':
        console.log(global.rooms.room);
        var roomId = socket.playerSession.character.currentRoom;
        console.log('current player room:' + roomId);
        global.rooms.room[roomId].inventory = results;
        break;
      default:
        break;
    }
    if (typeof callback === 'function') {
      console.log('triggering callback for loadInventory');
      callback(socket, callbackArgs);
    }
    else {
      console.log('No callback defined for loadInventory');
    }
  });
}

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

module.exports = new item();
