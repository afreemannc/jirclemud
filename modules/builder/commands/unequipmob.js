var Command = function() {
  this.trigger = 'unequipmob';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Equip a mob instance with an item. Note this change is permanent and this mob will load in this equipment going forward.

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
    console.log('input:' + input);
    console.log(Rooms.room[roomId].mobiles);
    var eqOptions = {};
    for (var i = 0; i < Rooms.room[roomId].mobiles.length; ++i) {
      var mobile = Rooms.room[roomId].mobiles[i];
      if (mobile.miid === parseInt(input)) {
        mobileIndex = i;
        var eqKeys = Object.keys(mobile.equipment);
        console.log('eq keys:');
        console.log(eqKeys);
        for (var j = 0; j < eqKeys.length; ++j) {
          if (mobile.equipment[eqKeys[j]] !== false) {
            var item = mobile.equipment[eqKeys[j]];
            eqOptions[eqKeys[j]] = item.name;
          }
        }
        break;
      }
    }

    if (mobileIndex === false) {
      session.error('There is no mobile with that id in this room.');
      return false;
    }
    console.log(eqOptions);
    eqoKeys = Object.keys(eqOptions);
    if (eqoKeys.length === 0) {
      session.error('That mobile is not currently equipped.');
      return false;
    }
    else {
      // Prompt builder for which item(s) to remove.
      var itemRemovePrompt = Prompt.new(session, this.removeItems);

      var mobIndexField = itemRemovePrompt.newField('value');
      mobIndexField.name = 'mobileIndex';
      mobIndexField.value = mobileIndex;
      itemRemovePrompt.addField(mobIndexField);

      var itemsField = itemRemovePrompt.newField('multiselect');
      itemsField.name = 'selectedItems';
      itemsField.options = eqOptions;
      itemsField.formatPrompt('Which equipment do you want to remove?\nCurrently equipped:');
      itemsField.cacheInput = function(input) {
        if (input !== '@@') {
          // unset in cached value on double entry
          var index = this.value.indexOf(input);
          if (index >= 0) {
            this.value.splice(index, 1);
          }
          else {
            this.value.push(input);
          }
          return false;
        }
        else {
          return true;
        }
      }
      itemRemovePrompt.addField(itemsField);

      itemRemovePrompt.start();
    }
  }

  this.removeItems = function(session, fieldValues) {
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
    session.write('Equipment removed.');

  }
}

module.exports = new Command();
