
// global configuration
module.exports = {
  mudName: '<your mud name here>',
  //port number MUD server should listen on
  port: 8765,

  // ### DB settings ###
  dbHost: '<db host>',
  dbName: '<db name>',
  dbUser: '<db username>',
  dbPass: '<db password>',
  dbDialect: '<database dialect>', // @see: http://docs.sequelizejs.com/en/1.7.0/docs/usage/#dialects
  // Uncomment this line if you are running mudjs on a mac with MAMP
  // dbUnixSocket: '/Applications/MAMP/tmp/mysql/mysql.sock',

  // ### MUD settings ###
  // Room id to start new characters in.
  startRoomId: 1,

  quitMessage: 'Goodbye!',

  // The Player Prompt is a color-coded HUD of critical character information that also servers as a command prompt.
  //
  // It is displayed below the room description, after a command is executed, and after each round of combat
  // has been displayed.
  //
  // Available tokens:
  //   - %currenthp% : characters current hitpoints
  //   - %currentmana% : characters current mana points
  //   - %xp% : characters current xp total
  //
  // Note: any keys added to the character.stats object will be available as tokens as well.
  // Example:
  //    A module adds "stamina" to character.stats
  //    %stamina% is now an available token
  //    The %stamina% token will display the value in character.stats.stamina
  //
  // Colors support:
  //   All of the Colors package styles are available as well.
  //   To Use:
  //      %style%<output to style>%style%
  //   @see https://www.npmjs.com/package/colors Colors package documentation for additional details:

  playerPrompt: '%red%%character.stats.currenthp%H%red% | %blue%%character.stats.currentmana%M%blue% | %cyan%%character.stats.xp%XP%cyan% >',

  // Characters may access the wimp command unless this is set to false.
  //
  // Note: turning wimp off guarantees a grittier combat experience and much higher player fatalities,
  // ESPECIALLY for new characters. Consider carefully what kind of experience you want players to have
  // before turning this off.
  wimpEnabled: true,

  // List of available equipment slots for characters
  // WARNING: removing or changing items from this list can make pre-existing equipment unwearable.
  // Proceed with caution, especially if you already have an active player base.
  equipmentSlots: {
    he: 'HEAD',
    fa: 'FACE',
    n:  'NECK',
    b:  'BODY',
    ab: 'ABOUT_BODY',
    ar: 'ARMS',
    wr: 'WRIST',
    ha: 'HANDS',
    fi: 'FINGER',
    wa: 'WAIST',
    l:  'LEGS',
    fe: 'FEET'
  },

  // Determines if items all load all the time. Item scarcity is typically a critical part of establishing an in-game economy
  itemScarcity: true,

  // ### Timers ###

  // World tic triggers mob movement and other events.
  //
  // Number of seconds between world tics
  worldTicInterval: 120
}
