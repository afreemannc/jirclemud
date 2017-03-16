var Command = function() {
  this.trigger = 'equiproom';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Permanently add or remove items in room inventory.
  Note: items added to a room in this way will spawn in this room whenever the zone is loaded
  or refreshes.

  %yellow%Usage:%yellow%
         equiproom

  %yellow%Example:%yellow%
         > Equiproom
         >
         > %bold%Do you want to add or remove items from this room?%bold%
         > $bold%[%yellow%A%yellow%] Add%bold%
         > $bold%[%yellow%R%yellow%] Remove%bold%
         >
  `;
  this.callback = function (session, input) {
    var roomId = session.character.current_room;
    var room = Rooms.room[roomId];
    var roomItems = {};
    for (var itemCount = 0; i < room.inventory.length; ++itemCount) {
      var item = room.inventory[i];
      roomItems[item.iid] = item.name;
    }

    // Prompt builder for equipment changes.
    var itemPrompt = Prompt.new(session, alterEquipment);

    var roomIdField = itemPrompt.newField('value');
    roomIdField.name = 'roomId';
    roomIdField.value = roomId;
    itemPrompt.addField(roomIdField);

    // Having op selectable only makes sense if items are present in room inventory that could be
    // removed.
    if (itemCount > 0) {
      var operationField = itemPrompt.newField('select');
      operationField.name = 'op';
      operationField.options = {a:'add', r:'remove'}
      operationField.formatPrompt('What kind of equipment change do you want to make?');
      itemPrompt.addField(operationField);
    }
    else {
      var operationField = itemPrompt.newField('value');
      operationField.name = 'op';
      operationField.value = 'add';
      itemPrompt.addField(operationField);
    }

    var itemAddField = itemPrompt.newField('int');
    itemAddField.name = 'item';
    itemAddField.formatPrompt('Enter the item ID to add:');
    itemAddField.conditional = {
      field: 'op',
      value: 'add'
    }
    itemPrompt.addField(itemAddField);

    if (itemCount < 0) {
      var itemRemoveField = itemPrompt.newField('select');
      itemRemoveField.name = 'item';
      itemRemoveField.options = roomItems;
      itemRemoveField.formatPrompt('Which item do you want to remove?');
      itemRemoveField.conditional = {
        field: 'op',
        value: 'remove',
      }
      itemPrompt.addField(itemRemoveField);
    }
    var slotGroup = itemPrompt.newField('fieldgroup');
    slotGroup.name = 'equipment',
    slotGroup.fields = ['slot', 'op', 'item'],
    slotGroup.formatPrompt('Change another slot?');
    itemPrompt.addField(slotGroup);

    itemPrompt.start();
  }

  // completion callback
  var alterEquipment = function(session, fieldValues) {
    console.log('field values:');
    console.log(fieldValues);
  }
}

module.exports = new Command();
