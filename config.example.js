
// global configuration
module.exports = {
  mudName: 'MUD MUD',
  //port number MUD server should listen on
  port: 8765,

  //DB stuffs
  dbHost: 'localhost',
  dbName: '<db name>',
  dbUser: '<db username>',
  dbPass: '<db password>',
  // Uncomment this line if you are running mudjs on a mac with MAMP
  // dbPort: '/Applications/MAMP/tmp/mysql/mysql.sock',

  // mud stuffs
  startRoomId: 1, // room new characters get dropped in

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

  playerPrompt: '%red%%currenthp%H%red% | %blue%%currentmana%M%blue% | %cyan%%xp%XP%cyan% >',

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
  }
}
