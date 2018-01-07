function roomCreationPrompt() {
  id: 'room_creation',
  completionCallback: Rooms.saveRoom,
  quittable: true,
  fields : {
    'zid': {
      name: 'zid',
      type: 'value',
      value: '',
    }
    'name': {
      name: 'name',
      type: 'text',
      title: 'Enter room name. (This is displayed at the top of the room description)'
    }
    'description': {
      name: 'description',
      type: 'multitext',
      title: 'Enter full room description. (This is displayed whenever a player enters the room)'
    }
    'flags': {
      name: 'flags',
      type: 'multiselect',
      title: 'What flags should be applied to this room? (Use these sparingly, especially DEATHTRAP)',
      options: {0:'none', sh:'SHOP', h:'HOT', c:'COLD', a:'AIR', w:'UNDERWATER', d:'DARK', sa:'SAVEPOINT', sm:'SMALL', rip:'DEATHTRAP'}
    }
    'inventory': {
      name: 'inventory',
      type: 'value',
      value: []
    }
  }
}

module.export = new roomCreationPrompt();
