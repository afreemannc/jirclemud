// Zone CRUD

function Zones() {
  this.zone = [];
  // Zone details need to be in memory for "where", help <zone>, and zone <zone id> commands
  //  to work without a bunch of grovelling.
  this.loadZones = function() {
    var sql = "SELECT * FROM zones";
    global.connection.query(sql, function(err, results, fields) {
      for(i = 0; i < results.length; ++i) {
        console.log('loading zone ' + results[i].zid);
        var zoneId = results[i].zid;
        global.zones.zone[zoneId] = results[i];
      }
    });
  }

  this.createZone = function(socket) {
    var createZonePrompt = global.prompt.new(socket, this.saveZone);

    // name
    var nameField = createZonePrompt.newField('text');
    nameField.name = 'name';
    nameField.startField = true;
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

    createZonePrompt.start();
  }

  this.editZoneName = function(socket, zoneId) {
    var zone = global.zones.zone[zoneId];
    var editZonePrompt = global.prompt.new(socket, this.saveZone);

    // name
    var currently = 'Currently:' + zone.name;
    var nameField = createZonePrompt.newField('text');
    nameField.name = 'name';
    nameField.startField = true;
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

  this.editZoneDescription = function(socket) {
    var zone = global.zones.zone[zoneId];
    var editZonePrompt = global.prompt.new(socket, this.saveZone);

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

  this.editZoneRating = function(socket) {
    var zone = global.zones.zone[zoneId];
    var editZonePrompt = global.prompt.new(socket, this.saveZone);

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
    // rating
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

  this.validateZoneName = function(socket, zoneName) {
    for (i = 0; i < global.zones.zone.length; ++i) {
      zone = global.zones.zone[i];
      if (zone.name = zoneName) {
        return false;
      }
    }
    return true;
  }

  this.saveZone = function(socket, fieldValues) {
    var values = {
      name:fieldValues.name,
      description:fieldValues.description,
      rating:fieldValues.rating
    }
    // If zid is passed in with field values this indicates changes to an existing zone
    // are being saved.
    if (typeof fieldValues.zid !== 'undefined') {
      values.zid = fieldValues.zid;
      socket.connection.query('UPDATE zones SET ? WHERE ZID = ' + values.zid, values, function (error, results) {
        // Update copy loaded in memory
        global.zones.zone[values.zid].name = values.name;
        global.zones.zone[values.zid].description = values.description;
        socket.playerSession.write('Zone changes saved.');
        socket.playerSession.inputContext = 'command';
      });
    }
    else {
      // If rid is not provided this should be saved as a new zone.
      socket.connection.query('INSERT INTO zones SET ?', values, function (error, results) {
        socket.playerSession.write('New zone saved.');
        socket.playerSession.inputContext = 'command';
        console.log('error:' + error);
        // Once a new zone is created we will need to also create a starter room so
        // construction can start. Otherwise I'm stuck adding a zone selection field to the
        // room creation and edit forms to no good purpose. Much simpler to make a room and then
        // bamf over to start construction.
        roomValues = {
          zid: results.insertId,
          name: 'In the beginning...',
          full_description: '... there was naught but darkness and chaos.',
          flags: [],
        }
        console.log('values going into room:');
        console.log(roomValues);
        global.rooms.saveRoom(socket, roomValues, global.commands.triggers.bamf, false);
      });
    }
  }
}

module.exports = new Zones();
