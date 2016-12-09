var item = function(){};

item.prototype.listTypes = function() {
  var list = ['weapon','equipment','misc','container','food'];
  return list;
}

// TODO: rename select option and/or label to more descriptive term
item.prototype.weapon = {
  name: 'Weapon',
  selectOption: 'w',
  label: '[::1::]eapon',
  description: 'Make things dead.'
}

item.prototype.equipment = {
  name: 'Equipment',
  selectOption: 'e',
  label: '[::2::]quipment',
  description: 'Wear it.'
}

item.prototype.misc = {
  name: 'Misc',
  label: '[::3::]isc',
  selectOption: 'm',
  description: 'Random junk.'
}

item.prototype.container = {
  name: 'Container',
  label: '[::4::]',
  selectOption: 'c',
  description: 'Put stuff in it.'
}

item.prototype.food = {
  name: 'Food',
  selectOption: 'f',
  label: '[::5::]ood',
  description: 'Eat it.'
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

  var createItemField = itemPrompt.newField();
  createItemField.name = 'create',
  createItemField.type = 'select',
  createItemField.options = ['y','n'],
  createItemField.inputCacheName = 'create',
  createItemField.promptMessage = ':: [::1::]es or [::2::]o ::';
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
    options.push(currentItem.selectOption);
  }
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

item.prototype.saveItem = function(socket, fieldValues, callback, callbackArgs) {
  console.log(fieldValues);
  var properties = {};
  values = {
    name:fieldValues.name,
    type:fieldValues.type,
    room_description:fieldValues.room_description,
    full_description:fieldValues.full_description,
    properties: JSON.stringify(properties)
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
  console.log(fieldValues);
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
  values = {
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

item.prototype.loadInventory = function(socket, fieldValues, callback, callbackArgs) {
  console.log('field values:');
  console.log(fieldValues);
  var inserts = [fieldValues.containerType, fieldValues.parentId];
  console.log('inserts:' + inserts);
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
  console.log('sql:' + sql);
  socket.connection.query(sql, function(err, results, fields) {
    switch(fieldValues.containerType) {
      case 'player_inventory':
        socket.playerSession.character.inventory = results;
        break;
      case 'room_inventory':
        socket.playerSession.room.inventory = results;
        break;
      default:
        break;
    }
    if (typeof callback === 'function') {
      callback(socket, callbackArgs);
    }
  });
}

item.prototype.inventoryDisplay = function(socket, inventory) {
  console.log('inv:');
  console.log(inventory);
  var output = '';
  for (i = 0; i < inventory.length; ++i) {
    output += inventory[i].name + "\n";
  }
  return output;
}

module.exports = new item();
