// Zone CRUD

function Zones() {

  // Zone details need to be in memory for "where", help <zone>, and zone <zone id> commands
  //  to work without a bunch of grovelling.
  this.loadZones = function() {

  }

  this.createZone = function(socket) {
    var createZonePrompt = global.prompt.new(socket, this.saveZone);

    // name
    var nameField = createZonePrompt.newField('text');
    nameField.name = 'name';
    nameField.startField = true;
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
    descriptionField.name = 'rating';
    descriptionField.options = options;
    descriptionField.formatPrompt('How hard is this zone?');
    createZonePrompt.addField(descriptionField);

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
    nameField.formatPrompt(currently + 'Enter zone name.');
    editZonePrompt.addField(nameField);
  }

  this.editZoneDescription = function(socket) {

  }

  this.editZoneRating = function(socket) {

  }

  this.validateZoneName = function(socket, zoneName) {

  }

  this.saveZone = function(socket, fieldValues) {
    var values = {
      name:fieldValues.name,
      description:fieldValues.description,
      flags:JSON.stringify(fieldValues.flags)
    }
    // If zid is passed in with field values this indicates changes to an existing room
    // are being saved.
    if (typeof fieldValues.zid !== 'undefined') {
      values.rid = fieldValues.zid;
      socket.connection.query('UPDATE zones SET ? WHERE RID = ' + values.zid, values, function (error, results) {
        // Update copy loaded in memory
        global.zones.zone[values.zid].name = values.name;
        global.zones.zone[values.zid].description = values.description;
        socket.playerSession.write('Zone changes saved.');
        socket.playerSession.inputContext = 'command';
      });
    }
    else {
      // If rid is not provided this should be saved as a new room.
      socket.connection.query('INSERT INTO zones SET ?', values, function (error, results) {
        socket.playerSession.write('New zone saved.');
        socket.playerSession.inputContext = 'command';
        if (typeof callback === 'function') {
          callback(socket, results.insertId, callbackArgs);
        }
      });
    }
  }
}

module.exports = new Zones();
