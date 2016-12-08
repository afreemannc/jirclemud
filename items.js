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

item.prototype.saveItem = function(socket, fieldValues, callback, args) {

}

module.exports = new item();
