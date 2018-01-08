// @file Zone-related CRUD and helper functions.

function zones() {};

// Storage for zones once they are loaded into memory.
zones.prototype.zone = {};

/**
 * Create zone refresh timers.
 *
 * Each timer controls when a given zone is refreshed.
 */
zones.prototype.registerTimers = function() {
  var Zone = Models.Zone;
  Zone.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var zoneId = instance.get('zid');
      var ticInterval = instance.get('tic_interval');
      var tic = Tics.addQueue('zone' + zoneId, ticInterval);

      tic.event.on('zone' + zoneId, function() {
        Zones.refreshZone(zoneId);
      });
    });
    Tics.startQueues();
  });
}

/**
 * Handle routine tasks required during a zone refresh.
 *
 * This includes:
 * - respawning any mobs that have been killed
 * - closing and locking any doors that have been unlocked or opened
 *
 */
zones.prototype.refreshZone = function(zoneId) {
    // Identify mobs that have been killed
    // Regenerate
    // Identify unlocked or opened doors that should be closed/locked
    // close open doors, lock if lockable.
}

/**
 * Load zones into memory and register zone refresh timers.
 */
zones.prototype.loadZones = function() {
  var Zone = Models.Zone;

  Zone.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var zone = instance.dataValues;
      zone.rooms = [];
      Zones.zone[instance.get('zid')] = zone;
    });
  });
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
zones.prototype.getCurrentZoneId = function(session) {
  var roomId = session.character.current_room;
  return Rooms.room[roomId].zid;
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
zones.prototype.validateZoneName = function(session, zoneName) {
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
zones.prototype.saveZone = function(session, fieldValues) {
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
    });
  }
  else {
    // If rid is not provided this should be saved as a new zone.
    Zone.create(values).then(function(zoneInstance) {
      var newZone = zoneInstance.dataValues;
      newZone.rooms = [];
      Zones.zone[zoneInstance.get('rid')] = newZone;
      session.write('New zone saved.');
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
        Commands.triggers.bamf(session, newRoomInstance.get('rid'));
      }).catch(function(error) {
        console.log('Zone Create Error: unable to create first room in zone:' + error);
      });
    }).catch(function(error) {
      console.log('Zone Create Error: unable to create new zone:' + error);
    });
  }
}

/**
 * List characters in a given zone.
 *
 * @param zoneId
 *   Numeric zone id to check for characters.
 */
zones.prototype.listPlayersInZone = function(zoneId) {
  // TODO: the display formatting here should probably get shoved into the where command.
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

zones.prototype.exportZone = function(zoneId) {
  var Zone = Models.Zone;
  Zone.findOne({where:{zid:zoneId}}).then(function(instance) {
    var zoneFile = JSON.stringify(instance.dataValues);
    // write zone file
  });

  var Room = Models.Room;
  Room.findAll({where:{zid:zoneId}}).then(function(instances) {
    var rooms =[];
    instances.forEach(function(instance) {
      rooms.push(instance.dataValues);
    })
    var roomsFile = JSON.stringify(rooms);
    // write rooms file
  });

  var Mobile = Models.Mobile;
  Mobile.findAll({where:{zid:zoneId}}).then(function(instances) {
    var mobs = [];
    var mids = [];
    instances.forEach(function(instance) {
      mids.push(instance.get('mid'));
      mobs.push(instance.dataValues);
    });
    var mobfile = JSON.stringify(mobs);
    // write mob file
    var MobilesInstance = Models.MobilesInstance;
    MobilesInstance.findAll({where:{mid:mids}}).then(function(instances) {
      var mobInstances = [];
      instances.forEach(function(instance) {
        mobInstances.push(instance.fieldValues);
      });
      var mobInstancesFile = JSON.stringify(mobInstances);
      // write mob instances
    });
  });
}

module.exports = new zones();
