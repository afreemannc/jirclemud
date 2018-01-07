function zoneCreationPrompt() {
  id: 'zone_creation',
  completionCallback: Zones.saveZone,
  quittable: true,
  fields: {

    'name': {
      name: 'name',
      type: 'text',
      title: 'Enter zone name:',
    }

    'description': {
      name: 'description',
      type: 'multitext',
      title: 'Describe this zone:'
    }

    'rating': {
      name: 'rating',
      type: 'select',
      title: 'How hard is this zone?',
      options: {
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
      },
      sanitizeInput = function(input) {
        input = input.toString().replace(/(\r\n|\n|\r)/gm,"");
        input = parseInt(input.toLowerCase());
        return input;
      },
      saveRawInput: true,
    }

    'tic_interval': {
      name: 'tic_interval',
      type: 'int',
      title: 'How frequently (in seconds) should this zone refresh? (ex. 3600 = 1 hour)'
    }
  }
}

module.export = new createZone();
