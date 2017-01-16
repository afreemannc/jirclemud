
function Mobile() {
  // load
  var worldQueue = Tics.findQueue('world');
  if (worldQueue) {
    worldQueue.event.on('world', function() {
      console.log('move mobs invoked');
      Mobiles.moveMobs();
    });
  }

  this.loadMobiles = function() {
    var MobilesInstance = Models.MobilesInstance;
    MobilesInstance.findAll().then(function(instances) {
      instances.forEach(function(instance) {
        var mobile = instance.dataValues;
        mobile.inventory = JSON.parse(mobile.inventory);
        mobile.stats = JSON.parse(mobile.stats);
        // Unpack equipment and generate item instances
        mobile.equipment = JSON.parse(mobile.equipment);
        console.log(mobile.equipment);
        var eqKeys = Object.keys(mobile.equipment);
        for (var i = 0; i < eqKeys.length; ++i) {
          var key = eqKeys[i];
          // skip empty slots.
          if (mobile.equipment[key] === false) {
            continue;
          }
          var iid = mobile.equipment[key];
          console.log('key:' + key);
          console.log('iid:' + iid);
          if (iid) {
            Items.generateItemInstance(iid, mobile.equipment, key);
          }
        }
        mobile.effects = JSON.parse(mobile.effects);
        mobile.extra = JSON.parse(mobile.extra);
        console.log('loaded mob:');
        console.log(mobile);
        Rooms.room[mobile.start_rid].mobiles.push(mobile);
      });
      console.log('Mobiles loaded');
    });
  }

  // create
  this.createMobile = function(session) {
    var createMobilePrompt = Prompt.new(session, this.saveNewMobile);

    // Name
    var mobileNameField = createMobilePrompt.newField('text');
    mobileNameField.name = 'name',
    mobileNameField.formatPrompt('What should this mobile be named? (Name displays in room.)'),
    createMobilePrompt.addField(mobileNameField);

    var mobileShortNameField = createMobilePrompt.newField('text');
    mobileShortNameField.name = 'short_name',
    mobileShortNameField.formatPrompt('Provide a short name: (Displays during move, by "scan", etc.)'),
    createMobilePrompt.addField(mobileShortNameField);


    // Description
    var mobileDescField = createMobilePrompt.newField('multitext');
    mobileDescField.name = 'description',
    mobileDescField.formatPrompt('Describe this mobile. (Description displayed by "look")'),
    createMobilePrompt.addField(mobileDescField);

    // Zone ID
    var mobileZidField = createMobilePrompt.newField('value');
    mobileZidField.name = 'zid';
    mobileZidField.value = Zones.getCurrentZoneId(session);
    createMobilePrompt.addField(mobileZidField);

    // HP
    var mobileHPField = createMobilePrompt.newField('int');
    mobileHPField.name = 'hp';
    mobileHPField.formatPrompt('How many hitpoints does this mob have?');
    createMobilePrompt.addField(mobileHPField);

    // MANA
    var mobileManaField = createMobilePrompt.newField('int');
    mobileManaField.name = 'mana';
    mobileManaField.formatPrompt('How many mana points does this mob have?');
    createMobilePrompt.addField(mobileManaField);

    // LEVEL
    var mobileLVLField = createMobilePrompt.newField('int');
    mobileLVLField.name = 'level';
    mobileLVLField.formatPrompt('What level is this mob?');
    createMobilePrompt.addField(mobileLVLField);

    var mobileHitField = createMobilePrompt.newField('int');
    mobileHitField.name = 'hit';
    mobileHitField.formatPrompt('To hit bonus:');
    createMobilePrompt.addField(mobileHitField);

    var mobileDamField = createMobilePrompt.newField('int');
    mobileDamField.name = 'dam';
    mobileDamField.formatPrompt('Damage bonus:');
    createMobilePrompt.addField(mobileDamField);

    // flags
    var mobileFlagsField = createMobilePrompt.newField('multiselect');
    mobileFlagsField.name = 'flags';
    mobileFlagsField.options = {n:'NONE', c:'CASTER', p:'PATROL', s:'SKILLED', a:'AGGRO', z:'ZONEHUNTER', w:'WORLDHUNTER'},
    mobileFlagsField.formatPrompt('What additional flags should this mob have?');
    createMobilePrompt.addField(mobileFlagsField);

    // TODO: effects field once spells are a thing
    var mobileEffectsField = createMobilePrompt.newField('value');
    mobileEffectsField.name = 'effects';
    mobileEffectsField.value = JSON.stringify([]);
    createMobilePrompt.addField(mobileEffectsField);

    // Note: extra is a placeholder for any additional data required by complex mobprogs.
    var mobileExtraField = createMobilePrompt.newField('value');
    mobileExtraField.name = 'extra';
    mobileExtraField.value = JSON.stringify({});
    createMobilePrompt.addField(mobileExtraField);

    createMobilePrompt.start();
  }

  // edit

    // name

    // description

    // stats

    // equipment

    // FLAGS

  // delete

  // save
  this.saveNewMobile = function(session, fieldValues) {
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
      effects:JSON.stringify(fieldValues.effects),
      equipment:JSON.stringify(Characters.initializeEqSlots()),
      inventory: JSON.stringify([]),
      extra:JSON.stringify({flags:fieldValues.flags})
    }
    var Mobile = Models.Mobile;
    Mobile.create(values).then(function(mobileInstance) {
      session.inputContext = 'command';
      session.write('New mob type saved.');
    });
  }

  this.moveMobs = function() {
    var roomKeys = Object.keys(Rooms.room);
    for(var i = 0; i < roomKeys.length; ++i) {
      var room = Rooms.room[roomKeys[i]];
      if (room.mobiles.length > 0) {
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

  this.displayMobile = function(session, mobile) {
    var output = mobile.description + ' is using:\n';
    output += Items.inventoryDisplay(mobile.equipment);
    session.write(Tokens.replace(output));
  }

  this.respawnMob = function(miid) {
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
}

module.exports = new Mobile();
