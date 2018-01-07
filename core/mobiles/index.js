
function Mobile() {
  // load
  var worldQueue = Tics.findQueue('world');
  if (worldQueue) {
    worldQueue.event.on('world', function() {
      Mobiles.moveMobs();
    });
  }
};

/**
 * World loading: load all mobiles worldwide.
 */
Mobile.prototype.loadMobiles = function() {
  var MobilesInstance = Models.MobilesInstance;
  MobilesInstance.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var mobile = instance.dataValues;
      mobile.inventory = JSON.parse(mobile.inventory);
      mobile.stats = JSON.parse(mobile.stats);
      // Unpack equipment and generate item instances
      mobile.equipment = JSON.parse(mobile.equipment);
      var eqKeys = Object.keys(mobile.equipment);

      for (var i = 0; i < eqKeys.length; ++i) {
        var key = eqKeys[i];
        // skip empty slots.
        if (mobile.equipment[key] === false) {
          continue;
        }
        var iid = mobile.equipment[key];

        if (iid) {
          Items.generateItemInstance(iid, mobile.equipment, key);
        }
      }

      mobile.effects = JSON.parse(mobile.effects);
      mobile.extra = JSON.parse(mobile.extra);
      Rooms.room[mobile.start_rid].mobiles.push(mobile);
    });
    console.log('Mobiles loaded');
  });
}


  // edit

    // name

    // description

    // stats

    // equipment

    // FLAGS

  // delete

  // save
Mobile.prototype.saveMobile = function(session, fieldValues) {
  var Mobile = Models.Mobile;
  // TODO: move details of stats group to world settings module, extend Prompt as needed
  // to support correct value grouping in fieldValues.

  // TODO: examine viability of fields being pre-stringified by Prompt. It would be nice to eliminate this
  // kind of conversion cropping up in all of the save functions.
  if (typeof fieldValues.mid !== 'undefined' && fieldValues.mid) {
    fieldValues.stats = JSON.stringify({
      hit: fieldValues.hit,
      dam: fieldValues.dam,
      max_hp: fieldValues.hp,
      current_hp: fieldValues.hp,
      max_mana: fieldValues.mana,
      current_mana: fieldValues.mana,
      level: fieldValues.level
    });
    fieldValues.effects = JSON.stringify(fieldValues.effects);
    fieldValues.equipment = JSON.stringify(Characters.initializeEqSlots()),
    fieldValuesinventory = JSON.stringify([]),
    fieldValues.extra = JSON.stringify({flags:fieldValues.flags})

    Mobile.update(fieldValues, {where: {mid:fieldValues.mid}}).then(function(response) {
      session.inputContext = 'command';
      session.write('Mobile changes saved.');
    });
  }
  else {
    var values = {
      zid: fieldValues.zid,
      name: fieldValues.name,
      short_name: fieldValues.short_name,
      description: fieldValues.description,
      stats: JSON.stringify({
        hit: fieldValues.hit,
        dam: fieldValues.dam,
        max_hp: fieldValues.hp,
        current_hp: fieldValues.hp,
        max_mana: fieldValues.mana,
        current_mana: fieldValues.mana,
        level: fieldValues.level
      }),
      effects: JSON.stringify(fieldValues.effects),
      equipment: JSON.stringify(Characters.initializeEqSlots()),
      inventory: JSON.stringify([]),
      extra: JSON.stringify({flags:fieldValues.flags})
    }

    Mobile.create(values).then(function(mobileInstance) {
      // TODO: have Prompt handle this automatically when completion callback is invoked. Having
      // to manually specify this behavior in a bunch of places is tedious and unnecessary.
      session.inputContext = 'command';
      session.write('New mob type saved.');
    });
  }
}

Mobile.prototype.moveMobs = function() {
  var roomKeys = Object.keys(Rooms.room);
  for(var i = 0; i < roomKeys.length; ++i) {
    var room = Rooms.room[roomKeys[i]];
    if (room.mobiles.length > 0) {
      // TODO: make it impossible for a mob to move, then win the lottery and move again when it's new room
      // is processed. Just say no to rocket mobs.
      for (var j = 0; j < room.mobiles.length; ++j) {
        var mobile = room.mobiles[j];
        if (mobile.extra.flags.includes('PATROL') && Rooms.hasExits(room)) {
          var exitKeys = Object.keys(room.exits);
          var exitCount = exitKeys.length;
          // mobs don't always move even when they can.
          var roll = Math.floor(Math.random() * (exitCount + 2));

          if (roll < exitCount) {
            var exit = room.exits[exitKeys[roll]];
            if (exit.properties.flags.includes('CLOSED')) {
              // No walking through doors y'all.
              Rooms.message(false, room.rid, mobile.short_name + ' nudges the door.', false);
              continue;
            }
            var label = exitKeys[roll];
            var targetRid = room.exits[label].target_rid;
            var index = room.mobiles.indexOf(mobile);
            Rooms.room[room.rid].mobiles.splice(index, 1);
            Rooms.room[targetRid].mobiles.push(mobile);
            Rooms.message(false, room.rid, mobile.short_name + ' leaves.', false);
            Rooms.message(false, targetRid, mobile.short_name + ' has arrived.', false);
          }
        }
      }
    }
  };
}

Mobile.prototype.displayMobile = function(session, mobile) {
  var output = mobile.description + ' is using:\n';
  output += Items.inventoryDisplay(mobile.equipment);
  session.write(Tokens.replace(output));
}

Mobile.prototype.respawnMob = function(miid) {
    // Load copy of mob instance from db
    // iterate equipment
       // generate item instance
       // place item instance in mob equipment slot
    // iterate inventory
       // generate item instance
       // place item instance in mob inventory
    // iterate effects
       // apply effects as needed
    // write mob instance to Rooms.room[roomId].mobiles;
    // rooms.write(A mob.name has arrived.);
}


module.exports = new Mobile();
