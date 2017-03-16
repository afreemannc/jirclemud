/**
 * Prompt for editing room name.
 */
module.exports.editRoomName = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editNamePrompt = Prompt.new(session, Room.saveRoom);

  var ridField = editNamePrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editNamePrompt.addField(ridField);

  var zoneIdField = editNamePrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  editNamePrompt.addField(zoneIdField);

  var currently =  'Currently:\n' + Tokens.replace('%cyan%%room.name%%cyan%', {room:current_room}) + '\n\n';
  var nameField = editNamePrompt.newField('text');
  nameField.name = 'name';
  nameField.formatPrompt(currently + 'Enter room name. (This is displayed at the top of the room description)');
  editNamePrompt.addField(nameField);


  var descField = editNamePrompt.newField('value');
  descField.name = 'description';
  descField.value = current_room.description;
  editNamePrompt.addField(descField);

  var flagsField = editNamePrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = current_room.flags;
  editNamePrompt.addField(flagsField);

  var inventoryField = editNamePrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = current_room.inventory;
  editNamePrompt.addField(inventoryValue);

  console.log('start name prompt');
  editNamePrompt.start();
}


module.exports.editRoomDesc = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editDescPrompt = Prompt.new(session, Room.saveRoom);

  var ridField = editDescPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editDescPrompt.addField(ridField);

  var zoneIdField = editDescPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  editDescPrompt.addField(zoneIdField);

  var nameField = editDescPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = current_room.name;
  editDescPrompt.addField(nameField);

  var currently = 'Currently:\n' + Tokens.replace('%cyan%%room.description%%cyan%', {room:current_room});
  var fullDescField = editDescPrompt.newField('multitext');
  fullDescField.name = 'description';
  fullDescField.formatPrompt(currently + 'Enter full room description. (This is displayed whenever a player enters the room)');
  editDescPrompt.addField(fullDescField);

  var flagsField = editDescPrompt.newField('value');
  flagsField.name = 'flags';
  flagsField.value = current_room.flags;
  editDescPrompt.addField(flagsField);

  var inventoryField = editDescPrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = current_room.inventory;
  editDescPrompt.addField(inventoryValue);

  editDescPrompt.start();
}

module.exports.editRoomFlags = function(session) {
  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var editFlagsPrompt = Prompt.new(session, Room.saveRoom);

  var ridField = editFlagsPrompt.newField('value');
  ridField.name = 'rid';
  ridField.value = roomId;
  editFlagsPrompt.addField(ridField);

  var zoneIdField = editFlagsPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  editFlagsPrompt.addField(zoneIdField);

  var nameField = editFlagsPrompt.newField('value');
  nameField.name = 'name';
  nameField.value = current_room.name;
  editFlagsPrompt.addField(nameField);

  var descField = editFlagsPrompt.newField('value');
  descField.name = 'description';
  descField.value = current_room.description;
  editFlagsPrompt.addField(descField);

  var currently = 'Currently:\n' + Tokens.replace('%cyan' + current_room.flags.join(', ') + '%cyan%');
  var flagsField = editFlagsPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  message += '[::0::] None [::h::]OT [::c::]OLD [::a::]IR UNDER[::w::]ATER [::d::]EATHTRAP';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'};
  flagsField.formatPrompt(currently + message, true);
  flagsField.value = Rooms.room[roomId].flags;
  editFlagsPrompt.addField(flagsField);

  var inventoryField = editFlagsPrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = current_room.inventory;
  editFlagsPrompt.addField(inventoryValue);

  editFlagsPrompt.start();
}
