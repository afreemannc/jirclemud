function Module() {
  this.name = 'Exports';
  this.description = 'Import and export zones.'
  this.version = '0.0.1';
  this.features = [];

  this.install = function() {
    Variables.set('exportsExportFilepath', '.modules/exports/zonefiles/exports/');
    Variables.set('exportsImportFilepath', '.modules/exports/zonefiles/imports/');
  }

  this.uninstall = function() {
    Variables.del('exportsExportFilepath');
    Variables.del('exportsImportFilepath');
  }

  this.load = function() {
    Admin.tasks['e'] = {
      name: 'Manage exports',
      callback: this.exportAdmin.bind(this)
    };
  }

  this.exportAdmin = function(session) {
    exportAdminPrompt = Prompt.new(session, this.exportActions.bind(this));

    var opField = exportAdminPrompt.newField('select');
    opField.name = 'op';
    opField.options = {i:'import zone', e:'export zone', q:'quit'};
    opField.saveRawInput = true;
    opField.formatPrompt('Exports options');
    exportAdminPrompt.addField(opField);

    var importZoneField = exportAdminPrompt.newField('select');
    importZoneField.name = 'importZone';
    importZoneField.options = this.listImportableZones();
    importZoneField.formatPrompt('Which zone would you like to import?');
    importZoneField.saveRawInput = true;
    importZoneField.conditional = {
      field: 'op',
      value: 'i',
    }
    exportAdminPrompt.addField(importZoneField);

    var exportZoneField = exportAdminPrompt.newField('select');
    exportZoneField.name = 'exportZone';
    exportZoneField.options = this.listExportableZones();
    exportZoneField.formatPrompt('Which zone would you like to export?');
    exportZoneField.saveRawInput = true;
    exportZoneField.conditional = {
      field: 'op',
      value: 'e',
    }
    exportAdminPrompt.addField(exportZoneField);

    exportAdminPrompt.start();
  };

  this.listImportableZones = function() {
    var fs = require('fs');
    var path = require('path');
    var zones = {};
    var count = 0;

    var importFilePath = Variables.get('exportsImportFilePath');
    console.log('import file path:' + importFilePath);
    console.log('cwd:' + process.cwd());
    fs.readdirSync(importFilePath)
      .filter(function(file) {
        return (file === "zone.js");
      })
      .forEach(function(file) {
        var zone = require(path.join(dir, file));
        zones[count] = zone.name;
        ++count;
      });


    return zones;
  }

  this.listExportableZones = function() {
    var options = {};
    console.log(Zones.zone);
    var zoneKeys = Object.keys(Zones.zone);
    for (var i = 0; i < zoneKeys.length; ++i) {
      options[zoneKeys[i]] = Zones.zone[zoneKeys[i]].name;
    }
    return options;
  }

  this.exportActions = function(session, fieldValues) {
    session.inputContext = 'command';
    switch(fieldValues.op) {
      case 'i':
        this.importZone(session, fieldValues);
        break;

      case 'e':
        this.exportZone(session, fieldValues);
        break;

      case 'q':
        Admin.listTasks(session);
        break;

      default:

    }
  };

  this.importZone = function(session, fieldValues) {
    session.write('import triggered');
    var fs = require('fs');
  };

  this.exportZone = function(session, fieldValues) {
    var fs = require('fs');
    var zid = fieldValues.exportZone;
    var Zone = Models.Zone;
    Zone.findOne({where:{zid: zid}}).then(function(instance) {
      var exportPath = Variables.get('exportsExportFilepath');
      var zoneName = instance.get('name');
      var zoneDir = exportPath + zoneName.split(' ').join('_');
      var zoneFileData = JSON.stringify(instance.dataValues);
      if (!fs.existsSync(zoneDir)) {
        fs.mkdirSync(zoneDir);
        fs.writeFile(zoneDir + '/zone.json', zoneFileData, function(error) {
          if (error) {
            console.log('Exports error: unable to write zone file! ' + error);
          }
          else {
            console.log('zone details exported');
            // rooms
            var roomData = [];
            var Room = Models.Room;
            Room.findAll({where:{zid: zid}}).then(function(instances) {
              var roomData = [];
              instances.forEach(function(instance) {
                // Having to export numeric ids is unfortunate and problematic. Some
                // better way of uniquely identifying a room that ensures no collisions
                // with existing room ids on import while still being able to easily
                // define exit parent rooms and targets would be nice. Maybe replace db defined
                // primary keys with some kind of code generated hash?
                var values = {
                  rid: instance.get('rid'),
                  name: instance.get('name'),
                  description: instance.get('description'),
                  flags: instance.get('flags'),
                  inventory: instance.get('inventory')
                }
                roomData.push(values);
              });
              var roomFileData = JSON.stringify(roomData);
              fs.writeFile(zoneDir + '/rooms.json', roomFileData, function(error) {
                if (error) {
                  console.log('Exports error: unable to write room file! ' + error);
                }
                else {
                  console.log('room details exported');
                }
              });
            });


            var RoomExit = Models.RoomExit;
            RoomExit.findAll({include: [{model: Room, as: 'Room', where:{zid: zid}}]}).then(function(instances) {
              var exitData = [];
              instances.forEach(function(instance) {
                var values = {
                  rid: instance.get('rid'),
                  target_rid: instance.get('target_rid'),
                  label: instance.get('label'),
                  description: instance.get('description'),
                  properties: instance.get('properties')
                }
                exitData.push(values);
              });
              var exitFileData = JSON.stringify(exitData);
              fs.writeFile(zoneDir + '/exits.json', exitFileData, function(error) {

              });
            });

            // items
            var Item = Models.Item;
            Item.findAll({where:{zid: zid}}).then(function(instances) {
              var itemData = [];
              instances.forEach(function(instance) {
                var values = {
                  name: instance.get('name'),
                  room_description: instance.get('room_description'),
                  full_description: instance.get('full_description'),
                  properties: instance.get('properties')
                }
                itemData.push(values);
              });
              var itemFileData = JSON.stringify(itemData);
              fs.writeFile(zoneDir + '/items.json', itemFileData, function(error) {

              });
            });

            // mob types
            var Mobile = Models.Mobile;
            Mobile.findAll({where:{zid: zid}}).then(function(instances) {
              var mobData = [];
              instances.forEach(function(instance) {
                var values = {
                   mid: instance.get('mid'),
                   start_rid:  instance.get('start_rid'),
                   name:  instance.get('name'),
                   short_name:  instance.get('short_name'),
                   description:  instance.get('description'),
                   stats:  instance.get('stats'),
                   effects:  instance.get('effects'),
                   equipment:  instance.get('equipment'),
                   inventory:  instance.get('inventory'),
                   extra:  instance.get('extra')
                }
                mobData.push(values);
              });
              var mobFileData = JSON.stringify(mobData);
              fs.writeFile(zoneDir + '/mobiles.json', mobFileData, function(error) {

              });
            });
            // mob instances
            var MobilesInstance = Models.MobilesInstance;
            MobilesInstance.findAll({include: [{model: Moobile, as: 'Mobile', where:{zid: zid}}]}).then(function(instances) {
              var mobInstanceData = [];
              instances.forEach(function(instance) {
                var values = {
                  mid: instance.get('mid'),
                  start_rid: instance.get('start_rid'),
                  name: instance.get('name'),
                  short_name: instance.get('short_name'),
                  description: instance.get('description'),
                  stats: instance.get('stats'),
                  effects: instance.get('effects'),
                  equipment: instance.get('equipment'),
                  inventory: instance.get('inventory'),
                  extra: instance.get('extra')
                };
                mobInstanceData.push(values);
              });
              var mobInstanceFileData = JSON.stringify(mobInstanceData);
              fs.writeFile(zoneDir + '/mobilesinstances.json', mobInstanceFileData, function(error) {

              });
            });
          }
        });
      }
      else {
        console.log('Exports error: Unable to create zone export folder, folder already exists! ' + zoneDir);
      }
    });
    session.write('export triggered');
  };
}

module.exports = new Module();
