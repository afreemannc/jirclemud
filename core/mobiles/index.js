
function Mobiles() {
  // load
  this.loadMobiles = function() {
    var MobilesInstance = Models.MobilesInstance;
    MobilesInstance.findAll().then(function(instances) {
      instances.forEach(function(instance) {
        var mobile = instance.dataValues;
        mobile.inventory = JSON.parse(mobile.inventory);
        mobile.stats = JSON.parse(mobile.stats);
        mobile.equipment = JSON.parse(mobile.equipment);
        mobile.effects = JSON.parse(mobile.effects);
        mobile.extra = JSON.parse(mobile.extra);

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
      effects:fieldValues.effects,
      equipment:JSON.stringify(Characters.initializeEqSlots),
      inventory: JSON.stringify([]),
      extra:JSON.stringify({flags:fieldValues.flags})
    }
    var Mobile = Models.Mobile;
    Mobile.create(values).then(function(mobileInstance) {
      session.inputContext = 'command';
      session.write('New mob type saved.');
    });
  }

  this.moveMobs = function(zoneId) {
    var Room = Models.Room;
    var zoneRoomIds = Zones.zone[zoneId].rooms;
      for(i = 0; i < zoneRoomIds.length; ++i) {
        var rid = zoneRoomIds[i];;
        if (Rooms.room[rid].mobiles.length > 0) {
          for (i = 0; i < Rooms.room[rid].mobiles.length; ++i) {
            var mobile = Rooms.room[rid].mobiles[i];
            if (mobile.extra.flags.includes('PATROL') && Rooms.hasExits(Rooms.room[rid])) {
              var exitKeys = Object.keys(Rooms.room[rid].exits);
              var exitCount = exitKeys.length;
              // mobs don't always move even when they can.
              var roll = Math.floor(Math.random() * (exitCount + 2));
              console.log('roll:' + roll);
              console.log('exit count:' + exitCount);

              if (roll < exitCount) {
                 var label = exitKeys[roll];
                 console.log('roll:' + roll);
                 console.log('label:' + label);
                 var targetRid = Rooms.room[rid].exits[label].target_rid;
                 var index = Rooms.room[rid].mobiles.indexOf(mobile);
                 Rooms.room[rid].mobiles.splice(index, 1);
                 Rooms.room[targetRid].mobiles.push(mobile);
                 console.log('Moved mob to ' + targetRid);
              }
            }
          }
        }
      };
  }
}

module.exports = new Mobiles();
