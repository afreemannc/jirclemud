
function Mobiles() {
  // load
  this.loadMobiles = function() {
    var Mobile = Models.Mobile;
    Mobile.findAll().then(function(instances) {
      instances.forEach(function(instance) {
        var mobile = instance.dataValues;
        mobile.inventory = Containers.loadInventory({inventoryType:'mobile', parentId: mobile.mid});
        mobile.stats = JSON.parse(mobile.stats);
        mobile.equipment = JSON.parse(mobile.equipment);
        mobile.effects = JSON.parse(mobile.effects);
        mobile.extra = JSON.parse(mobile.extra);

        Rooms.room[mobile.start_rid].push(mobile);
      });
      console.log('Mobiles loaded');
    });
  }

  // create
  this.create = function(session) {
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
    var mobileZidField = createMobilePrompt.newField('select');
    mobileZidField.name = 'zid';
    mobileZidField.value = Zones.getCurrentZoneId(session);
    createMobilePrompt.addField(mobileZidField);

    // Room ID
    var mobileRidField = createMobilePrompt.newField('value');
    mobileRidField.name = 'start_rid';
    mobileRidField.value = session.character.current_room;
    createMobilePrompt.addField(mobileRidField);

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
      start_rid: fieldValues.start_rid,
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
      });
      effects:fieldValues.effects,
      extra:fieldValues.extra
    }
    var Mobile = Models.Mobile;
    Mobile.create(values).then(function(mobileInstance) {
      var Container = Models.Container;
      var containerValues = {
        container_type: 'mobile',
        parent_id: mobileInstance.get('mid'),
        max_size: -1, // TODO: correct these based on str
        max_weight: -1, // TODO: correct these based on str
      }
      // This can happen asyncronously so no need for .then().
      Container.create(containerValues);
      Rooms.room[mobileInstance.get('start_rid')].mobiles.push(mobileInstance.dataValues);
      session.write('New mob created.');
    });
  }
}

module.exports = new Mobiles();
