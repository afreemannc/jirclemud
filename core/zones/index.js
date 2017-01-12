// @file Zone-related CRUD and helper functions.

function zones() {
  // Storage for zones once they are loaded into memory.
  this.zone = {};

  /**
   * Create zone refresh timers.
   *
   * Each timer controls when a given zone is refreshed.
   */
  this.registerTimers = function() {
    var Zone = Models.Zone;
    Zone.findAll().then(function(instances) {
      instances.forEach(function(instance) {
        var zoneId = instance.get('zid');
        var ticInterval = instance.get('tic_interval');
        console.log('registering zone timer:' + zoneId);
        var tic = Tics.addQueue('zone' + zoneId, ticInterval);
        tic.event.on('zone' + zoneId, function() {
          console.log('zone ' + zoneId + ' tic event');
          Mobiles.moveMobs(zoneId);
        });
      });
      Tics.startQueues();
    });
  };

  /**
   * Handle routine tasks required during a zone refresh.
   *
   * This includes:
   * - respawning any mobs that have been killed
   * - closing and locking any doors that have been unlocked or opened
   *
   */
  this.refreshZone(zoneId) {
    // Identify mobs that have been killed
    // Regenerate
    // Identify unlocked or opened doors that should be closed/locked
    // close open doors, lock if lockable.
  }

  /**
   * Load zones into memory.
   */
  this.loadZones = function() {
    var Zone = Models.Zone;
    Zone.findAll().then(function(instances) {
      instances.forEach(function(instance) {
        var zone = instance.dataValues;
        zone.rooms = [];
        Zones.zone[instance.get('zid')] = zone;
      });
    });
    console.log('Zones loaded');
    Zones.registerTimers();
  }

  /**
   * Look up the zone id for the zone a player is in.
   *
   * @param session
   *   Player session object
   *
   * @return
   *   Returns the zone id for the room the player is in currently.
   *
   */
  this.getCurrentZoneId = function(session) {
    var roomId = session.character.current_room;
    return Rooms.room[roomId].zid;
  }

  /**
   * Zone creation prompt.
   */
  this.createZone = function(session) {
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
    ratingField.cacheInput = function(input) {
      this.value = input;
      return true;
    };
    createZonePrompt.addField(ratingField);


    var ticIntervalField = createZonePrompt.addField('int');
    ticIntervalField.name = 'tic_interval';
    ticInterval.formatPrompt('How frequently (in seconds) should this zone refresh? (ex. 3600 = 1 hour)');
    createZonePrompt.addField(ticIntervalField);

    createZonePrompt.start();
  }

  /**
   * Zone name edit prompt.
   */
  this.editZoneName = function(session, zoneId) {
    var zone = Zones.zone[zoneId];
    var editZonePrompt = Prompt.new(session, this.saveZone);

    // name
    var currently = 'Currently:' + zone.name;
    var nameField = createZonePrompt.newField('text');
    nameField.name = 'name';
    nameField.validate = this.validateZoneName;
    nameField.formatPrompt(currently + 'Enter zone name.');
    editZonePrompt.addField(nameField);

    // description
    var descriptionField = createZonePrompt.newField('value');
    descriptionField.name = 'description';
    descriptionField.value = zone.description;
    editZonePrompt.addField(descriptionField);

    // rating
    var ratingField = createZonePrompt.newField('value');
    ratingField.name = 'rating';
    ratingField.value = zone.rating;
    editZonePrompt.addField(ratingField);

    editZonePrompt.start();
  }

  /**
   * Zone description edit prompt.
   */
  this.editZoneDescription = function(session) {
    var zone = Zones.zone[zoneId];
    var editZonePrompt = Prompt.new(session, this.saveZone);

    var nameField = createZonePrompt.newField('value');
    nameField.name = 'name';
    nameField.value = zone.name;
    editZonePrompt.addField(nameField);

    var currently = 'Currently:' + zone.description;
    var descriptionField = editZonePrompt.newField('multitext');
    descriptionField.name = 'description';
    descriptionField.formatPrompt(currently + 'Describe this zone.');
    editZonePrompt.addField(descriptionField);

    var ratingField = createZonePrompt.newField('value');
    ratingField.name = 'rating';
    ratingField.value = zone.rating;
    editZonePrompt.addField(ratingField);

    editZonePrompt.start();
  }

  /**
   * Zone rating edit prompt.
   */
  this.editZoneRating = function(session) {
    var zone = Zones.zone[zoneId];
    var editZonePrompt = Prompt.new(session, this.saveZone);

    var nameField = createZonePrompt.newField('value');
    nameField.name = 'name';
    nameField.value = zone.name;
    editZonePrompt.addField(nameField);

    var descriptionField = createZonePrompt.newField('value');
    descriptionField.name = 'description';
    descriptionField.value = zone.description;
    editZonePrompt.addField(descriptionField);

    var currently = 'Currently:' + zone.rating;
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

    var ratingField = editZonePrompt.newField('select');
    descriptionField.name = 'rating';
    descriptionField.options = options;
    descriptionField.formatPrompt(currently + 'How hard is this zone?');
    ratingField.sanitizeInput = function(input) {
      input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
      input = parseInt(input.toLowerCase());
      return input;
    }
    ratingField.cacheInput = function(input) {
      this.value = input;
      return true;
    };
    editZonePrompt.addField(descriptionField);

    editZonePrompt.start();

  }

  /**
   * Check if a zone already exists with the given name.
   *
   * @param session
   *   Player session object. Unused, but must be accounted for as
   *   the prompt system always passes this as the first parameter to
   *   any validation callback.
   *
   * @param zoneName
   *  Name to look for.
   *
   * @return
   *   return true if the zone name isn't already in use, otherwise false.
   */
  this.validateZoneName = function(session, zoneName) {
    for (var i = 0; i < Zones.zone.length; ++i) {
      var zone = Zones.zone[i];
      if (zone.name = zoneName) {
        return false;
      }
    }
    return true;
  }

  /**
   * Prompt completion callback for zone creation and editing prompts.
   */
  this.saveZone = function(session, fieldValues) {
    var Zone = Models.Zone;
    var values = {
      name:fieldValues.name,
      description:fieldValues.description,
      rating:fieldValues.rating,
      tic_interval:fieldValues.tic_interval
    }
    // If zid is passed in with field values this indicates changes to an existing zone
    // are being saved.
    if (typeof fieldValues.zid !== 'undefined') {
      values.zid = fieldValues.zid;
      Zone.update(values, {zid: fieldValues.zid}).then(function(zoneInstance) {
        // Update copy loaded in memory
        Zones.zone[values.zid].name = values.name;
        Zones.zone[values.zid].description = values.description;
        Zones.zone[values.zid].rating = values.rating;
        session.write('Zone changes saved.');
        session.inputContext = 'command';
      });
    }
    else {
      // If rid is not provided this should be saved as a new zone.
      Zone.create(values).then(function(zoneInstance) {
        var newZone = zoneInstance.dataValues;
        newZone.rooms = [];
        Zones.zone[zoneInstance.get('rid')] = newZone;
        session.write('New zone saved.');
        session.inputContext = 'command';
        // Once a new zone is created we will need to also create a starter room so
        // construction can start. Otherwise I'm stuck adding a zone selection field to the
        // room creation and edit forms to no good purpose. Much simpler to make a room and then
        // bamf over to start construction.
        var Room = Models.Room;
        var values = {
          zid: zoneInstance.get('zid'),
          name: 'In the beginning...',
          description: '... there was naught but darkness and chaos.',
          flags: JSON.stringify([])
        }
        Room.create(values).then(function(newRoomInstance) {
          var newRoom = newRoomInstance.dataValues;
          newRoom.exits = {};
          newRoom.inventory = [];
          newRoom.flags = JSON.parse(newRoom.flags);
          Rooms.room[newRoomInstance.get('rid')] = newRoom;
          Zones.zone[newRoom.zid].rooms.push(newRoom.rid);
          session.write('First room in zone created.');
          console.log(newRoomInstance);
          Commands.triggers.bamf(session, newRoomInstance.get('rid'));
        }).catch(function(error) {
          console.log('Zone Create Error: unable to create first room in zone:' + error);
        });
      }).catch(function(error) {
        console.log('Zone Create Error: unable to create new zone:' + error);
      });
    }
  }

  this.listPlayersInZone = function(zoneId) {
    var characters = [];
    for (var i = 0; i < Sessions.length; ++i) {
      if (typeof Sessions[i].character !== 'undefined') {
        var character = Sessions[i].character;
        var zid = Rooms.room[character.current_room].zid;
        if (zid === zoneId) {
          characters.push(character.name + '          - ' + Rooms.room[character.current_room].name);
        }
      }
    };
    return characters.join('\n');
  }
}

module.exports = new zones();
