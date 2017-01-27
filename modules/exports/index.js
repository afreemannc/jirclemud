function Module() {
  this.name = 'Exports';
  this.description = 'Import and export zones.'
  this.version = '0.0.1';
  this.features = [];

  this.install = function() {
    Variables.set('exportsExportFilepath', './zonefiles/exports/');
  }

  this.load = function() {
    Admin.tasks['e'] = {
      name: 'Manage exports',
      callback: this.exportAdmin.bind(this)
    };
  }

  this.exportAdmin = function(session) {
    console.log(this);
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
    return {n:'nothing', t:'test'};
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
  };

  this.exportZone = function(session, fieldValues) {
    var fs = require('fs');
    var Zone = Models.Zone;
    Zone.findOne({where:{zid:fieldValues.exportZone}}).then(function(instance) {
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
