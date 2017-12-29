
/**
 * Item creation screen.
 *
 * @param session
 *   Character session object.
 */
module.exports.createItem = function(session) {
  var roomId = session.character.current_room;
  var zid = Rooms.room[roomId].zid;

  var itemPrompt = Prompt.new(session, this.saveNewItem);

  // Item definitions are tied to a specific zone to make life easier
  // when equipping mobiles. Having zid in this table makes listing
  // items associated with the zone trivial.

  var zidField = itemPrompt.newField('value');
  zidField.name = 'zid';
  zidField.value = zid;
  itemPrompt.addField(zidField);

  var nameField = itemPrompt.newField('text');
  nameField.name = 'name';
  nameField.inputCacheName = 'name';
  nameField.formatPrompt('What do you want to name it? Note the name is what is displayed in personal inventory or when equipped.');
  itemPrompt.addField(nameField);

  var roomDescriptionField = itemPrompt.newField('text');
  roomDescriptionField.name = 'room_description';
  roomDescriptionField.formatPrompt('Provide a short description of the item that will be shown when it is sitting out in a room.');
  itemPrompt.addField(roomDescriptionField);

  var fullDescriptionField = itemPrompt.newField('multitext');
  fullDescriptionField.name = 'full_description';
  fullDescriptionField.formatPrompt('Provide a thorough description. This is what will be displayed if this item is examined.');
  itemPrompt.addField(fullDescriptionField);

  // Required to drive item scarcity if it is enabled.
  if (typeof Config.itemScarcity !== 'undefined' && Config.itemScarcity === true) {
    var maxCountField = itemPrompt.newField('int');
    maxCountField.name = 'max_count';
    maxCountField.formatPrompt('How many of this item can exist in the world at one time? (-1 for unlimited)');
    itemPrompt.addField(maxCountField);

    var loadChanceField = itemPrompt.newField('int');
    loadChanceField.name = 'load_chance';
    loadChanceField.maxint = 100;
    loadChanceField.formatPrompt('What are is % chance of this item loading on respawn? (100 for always)');
    itemPrompt.addField(loadChanceField);
  }

  var flagsField = itemPrompt.newField('multiselect');
  flagsField.name = 'flags';
  flagsField.options = Items.flags;
  flagsField.formatPrompt('Select one or more flags to assign to this item');
  itemPrompt.addField(flagsField);

  // Conditional fields

  // PORTAL destination room id
  var portalDestinationField = itemPrompt.newField('int');
  portalDestinationField.name = 'target_rid',
  portalDestinationField.conditional = {
    field: 'flags',
    value: 'PORTAL',
  }
  portalDestinationField.formatPrompt('Enter numeric room id this portal should lead to.');
  itemPrompt.addField(portalDestinationField);

  // container size
  var containerSizeField = itemPrompt.newField('int');
  containerSizeField.name = 'containerSize';
  containerSizeField.conditional = {
    field: 'flags',
    value: 'CONTAINER'
  };
  containerSizeField.formatPrompt('Enter container size as a number.');
  itemPrompt.addField(containerSizeField);

  // Wear slot
  var wearSlotField = itemPrompt.newField('select');
  wearSlotField.name = 'equipment_slot';
  wearSlotField.options = Config.equipmentSlots;
  wearSlotField.conditional = {
    field: 'flags',
    value: 'WEARABLE',
  }
  wearSlotField.formatPrompt('Where can this be worn?');
  itemPrompt.addField(wearSlotField);

  // Wield fields
  // base damage dice
  var damageDiceField = itemPrompt.newField('dice');
  damageDiceField.name = 'damage_dice';
  damageDiceField.formatPrompt('Weapon base damage dice');
  damageDiceField.conditional = {
    field: 'flags',
    value: 'WIELD',
  }
  itemPrompt.addField(damageDiceField);

   // TODO: spell affect
      // spell
      // percentage fire
      // strength ??
    // additional effects
  var selectEffectField = itemPrompt.newField('select');
  selectEffectField.name = 'effectType';
  selectEffectField.options = {d:'dam', h:'hit', a:'ac', s:'stat'};
  selectEffectField.formatPrompt('What additional effects does this equipment have?');
  selectEffectField.conditional = {
    field: 'flags',
    value: ['WIELD', 'HOLD', 'WEARABLE']
  }
  itemPrompt.addField(selectEffectField);

  var statField = itemPrompt.newField('select');
  statField.name = 'affectedStat';
  statField.options = {i:'int', w:'wis', ch:'cha', s:'str', co:'con', d:'dex'};
  statField.formatPrompt('Select a stat to buff');
  statField.conditional = {
    field: 'effectType',
    value: 'stat',
  }
  itemPrompt.addField(statField);

  var bonusField = itemPrompt.newField('int');
  bonusField.name = 'bonus';
  bonusField.formatPrompt('Effect bonus (positive or negative numbers only)');
  bonusField.conditional = {
    field: 'effectType',
    value: ['dam', 'hit', 'ac', 'stat']
  }
  itemPrompt.addField(bonusField);
  // bonus reiteration handled by fieldGroup processing code. No need to add
  // additional prompt logic here.
  var bonusFieldGroup = itemPrompt.newField('fieldgroup');
  bonusFieldGroup.name = 'effects',
  bonusFieldGroup.fields = ['effectType', 'affectedStat', 'bonus'],
  bonusFieldGroup.formatPrompt('Do you wish to add another effect to this item?');
  bonusFieldGroup.conditional = {
    field: 'effectType',
    value: ['dam', 'hit', 'ac', 'stat']
  }
  itemPrompt.addField(bonusFieldGroup);

  itemPrompt.start();
}


/**
 * Room creation prompt.
 */
module.exports.createRoom = function(session) {

  var roomId = session.character.current_room;
  var current_room = Rooms.room[roomId];

  var createRoomPrompt = Prompt.new(session, this.saveRoom);

  var zoneIdField = createRoomPrompt.newField('value');
  zoneIdField.name = 'zid';
  zoneIdField.value = current_room.zid;
  createRoomPrompt.addField(zoneIdField);

  var nameField = createRoomPrompt.newField('text');
  nameField.name = 'name';
  nameField.formatPrompt('Enter room name. (This is displayed at the top of the room description)');
  createRoomPrompt.addField(nameField);

  var fullDescField = createRoomPrompt.newField('multitext');
  fullDescField.name = 'description';
  fullDescField.formatPrompt('Enter full room description. (This is displayed whenever a player enters the room)');
  createRoomPrompt.addField(fullDescField);


  var flagsField = createRoomPrompt.newField('multiselect');
  var message = 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)\n';
  flagsField.name = 'flags';
  flagsField.options = {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'};
  flagsField.formatPrompt(message);
  createRoomPrompt.addField(flagsField);

  // Placeholder value for db record creation. Room inventory gets populated by item and mobile placement commands.
  var inventoryField = createRoomPrompt.newField('value');
  inventoryField.name = 'inventory';
  inventoryValue = [];
  createRoomPrompt.addField(inventoryValue);

  createRoomPrompt.start();
}

/**
 * Zone creation prompt.
 */
module.exports.createZone = function(session) {
  var createZonePrompt = Prompt.new(session, this.saveZone);

  // name
  var nameField = createZonePrompt.newField('text');
  nameField.name = 'name';
  nameField.validate = this.validateZoneName;
  nameField.formatPrompt('Enter zone name.');
  createZonePrompt.addField(nameField);
  // descrption
  var descriptionField = createZonePrompt.newField('multitext');
  descriptionField.name = 'description';
  descriptionField.formatPrompt('Describe this zone.');
  createZonePrompt.addField(descriptionField);

  var options = {
      0:'Unpopulated rooms, simple navigation, no threats.',
      1:'Unarmed mobs with less than 3 hp, straightforward navigation, no room effects or DTs',
      2:'Armed or unarmed mobs with low damage, less than 20 hp, straightforward navigation, no room effects or DTs',
      3:'Armed or unarmed mobs up to 200 hp, no or small spell effects, room effects unlikely, no DTs',
      4:'Armed or unarmed mobs up to 1000hp, mid-level spell effects on boss mobs, room effects rare, DTs very rare',
      5:'Armed or unarmed mobs up to 2000hp, mid-level spell effects on all caster mobs, room effects and DTs possible',
      6:'Soloable. Mobs up to 3k HP, mid-level spell effects common, high level spells likely on boss mobs, room effects and DTs likely',
      7:'Difficult and time consuming to solo. Mobs with 3k+ HP common, high level spell use common, awkward navigation, room effects and DTs likely',
      8:'Cannot be solod effectively, ocassionally kills entire groups. Mobs with 3k+ HP everywhere, high level spell use ubiquitous, awkward navigation, room effects and DTs guaranteed',
      9:'Cannot be solod at all, frequently kills full groups. Mob HP set to ludicrous levels, spell effects ubiquitous, mazy navigation, puzzles, and deadly room effects guaranteed',
     10:'Routinely kills full groups of high level characters with top end equipment. No trick is too dirty.',
  };
  // rating
  var ratingField = createZonePrompt.newField('select');
  ratingField.name = 'rating';
  ratingField.options = options;
  ratingField.formatPrompt('How hard is this zone?');
  ratingField.sanitizeInput = function(input) {
    input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
    input = parseInt(input.toLowerCase());
    return input;
  }
  ratingField.saveRawInput = true;
  createZonePrompt.addField(ratingField);

  var ticIntervalField = createZonePrompt.addField('int');
  ticIntervalField.name = 'tic_interval';
  ticInterval.formatPrompt('How frequently (in seconds) should this zone refresh? (ex. 3600 = 1 hour)');
  createZonePrompt.addField(ticIntervalField);

  createZonePrompt.start();
}

/**
 * Mobile type creation screen.
 *
 * @param session
 *   Player session object.
 *
 */
module.exports.createMobile = function(session) {
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
