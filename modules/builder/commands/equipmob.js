var Command = function() {
  this.trigger = 'equipmob';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Equip a mob instance with an item. Note this change is permanent and this mob will load with this equipment going forward.

  %yellow%Usage:%yellow%
         equipmob <mob id>

  %yellow%Usage:%yellow%
         > equipmob 1
         >
  `;
  this.callback = function (session, input) {
    var roomId = session.character.current_room;
    var zoneId = Rooms.room[roomId].zid;

    var mobileIndex = false;
    var eqOptions = {};

    for (var i = 0; i < Rooms.room[roomId].mobiles.length; ++i) {
      var mobile = Rooms.room[roomId].mobiles[i];
      if (mobile.miid === parseInt(input)) {
        mobileIndex = i;
        var eqKeys = Object.keys(mobile.equipment);
        for (var j = 0; j < eqKeys.length; ++j) {
          var key = eqKeys[j];
          var slot = key.toLowerCase();
          if (mobile.equipment[eqKeys[j]] !== false) {
            var item = mobile.equipment[eqKeys[j]];
            eqOptions[slot] = item.iid + '::' + item.name;
          }
          else {

            eqOptions[slot] = 'empty';
          }
        }
        break;
      }
    }

    if (mobileIndex === false) {
      session.error('There is no mobile with that id in this room.');
      return false;
    }
    // Prompt builder for equipment changes.
    var itemPrompt = Prompt.new(session, alterEquipment);

    var mobIndexField = itemPrompt.newField('value');
    mobIndexField.name = 'mobileIndex';
    mobIndexField.value = mobileIndex;
    itemPrompt.addField(mobIndexField);

    var eqSlotField = itemPrompt.newField('select');
    eqSlotField.name = 'slot';
    eqSlotField.options = eqOptions;
    eqSlotField.formatPrompt('Which equipment do you want to remove?\nCurrently equipped:');
    eqSlotField.saveRawInput = true;
    itemPrompt.addField(eqSlotField);

    var operationField = itemPrompt.newField('select');
    operationField.name = 'op';
    operationField.options = {a:'add', r:'remove'}
    operationField.formatPrompt('What kind of equipment change do you want to make?');
    itemPrompt.addField(operationField);

    var itemField = itemPrompt.newField('int');
    itemField.name = 'item';
    itemField.formatPrompt('Enter the item ID to add:');
    itemField.conditional = {
      field: 'op',
      value: 'add'
    }
    itemPrompt.addField(itemField);

    var slotGroup = itemPrompt.newField('fieldgroup');
    slotGroup.name = 'equipment',
    slotGroup.fields = ['slot', 'op', 'item'],
    slotGroup.formatPrompt('Change another slot?');
    itemPrompt.addField(slotGroup);

    itemPrompt.start();
  }

  var alterEquipment = function(session, fieldValues) {
    var roomId = session.character.current_room;
    var mobile = Rooms.room[roomId].mobiles[fieldValues.mobileIndex];
    var equipment = {};
    // TODO: prompt system should handle this automatically.
    session.inputContext = 'command';

    // apply changes to memory
    for (var i = 0; i < fieldValues.equipment.length; ++i) {
      if (fieldValues.op === 'remove') {
        var slot = fieldValues.equipment[i].slot;
        slot = slot.toUpperCase();
        Rooms.room[roomId].mobiles[fieldValues.mobileIndex].equipment[slot] = false;
        equipment[slot] = false;
      }
      else {
        var slot = fieldValues.equipment[i].slot;
        var iid = fieldValues.equipment[i].item;
        var mobile = Rooms.room[roomId].mobiles[fieldValues.mobileIndex];
        equipment[slot] = iid;
        Items.generateItemInstance(iid, mobile.equipment, slot);
      }
    }
    // build out the rest of the equipment record and update db.
    var eqKeys = Object.keys(mobile.equipment);
    for (var i = 0; i < eqKeys.length; ++i) {
      if (typeof equipment[eqKeys[i]] !== 'undefined') {
        continue;
      }
      if (mobile.equipment[eqKeys[i]] === false) {
        // empty slot
        equipment[eqKeys[i]] = false;
      }
      else {
        equipment[eqKeys[i]] = Mobile.equipment[eqKeys[i]].iid;
      }
    }
    equipment = JSON.stringify(equipment);
    console.log('equipment pre-save:');
    console.log(equipment);
    var MobilesInstance = Models.MobilesInstance;
    MobilesInstance.update({equipment:equipment}, {where:{miid: mobile.miid}}).then(function() {
      session.write('Equipment changes saved.');
    });

   /*
    var roomId = session.character.current_room;
    var mobile = Rooms.room[roomId].mobiles[fieldValues.mobileIndex];

    for (var i = 0; i < fieldValues.selectedItems.length; ++i) {
      var itemSlot = fieldValues.selectedItems[i];
      // destroy item instance in memory;
      mobile.equipment[itemSlot] = false;
    }
    // reformat equipment for db save
    var equipment = {};
    var eqKeys = Object.keys(mobile.equipment);
    for (var i = 0; i < eqKeys.length; ++i) {
      if (mobile.equipment[eqKeys[i]]) {
        equipment[eqKeys[i]] = mobile.equipment[eqKeys[i]].iid;
      }
      else {
        equipment[eqKeys[i]] = false;
      }
    }
    // update db
    var MobilesInstance = Models.MobilesInstance;
    MobilesInstance.update({equipment: JSON.stringify(equipment)}, {where:{miid:mobile.miid}});
    session.write('Equipment removed.');*/
    return true;
  }
}

module.exports = new Command();
