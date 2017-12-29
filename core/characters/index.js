// user stuff
var dice = require('./dice');
var crypto = require('crypto');
// Session mode handler for login

var characters = function(){};


/**
 * Login screen.
 *
 * @param session
 *   Session object.
 */
characters.prototype.login = function(session) {

  var loginPrompt = Prompt.new(session, this.loginAuthenticate, 'login');
  loginPrompt.quittable = false;

  var loginField = loginPrompt.newField('text');
  loginField.name = 'username';
  loginField.formatPrompt('Character Name:');
  loginPrompt.addField(loginField);

  var passwordField = loginPrompt.newField('text');
  passwordField.name = 'password';
  passwordField.formatPrompt('Password:');
  loginPrompt.addField(passwordField);

  loginPrompt.start();
}

/**
 * Login screen completion handler.
 *
 * @param session
 *   Character session object.
 *
 * @param fieldValues
 *   User input values from login screen.
 */
characters.prototype.loginAuthenticate = function(session, fieldValues) {
  var Character = Models.Character;
  var userName = fieldValues.username;
  var password = fieldValues.password;
  // Salt is required to generate the user's password hash.
  Character.findOne({attributes:['salt'],where: {name:userName}}).then(function(instance) {
    if (instance) {
      var salt = instance.get('salt');
      var passwordHash = Characters.passHash(salt, password);
      // Attempt authentication
      Character.findOne({where: {name:userName,pass:passwordHash}}).then(function(results) {
        if (results) {
          // Authentication successful, load character details.
          var character = results.dataValues;
          session.character = character;
          Characters.loadCharacterDetails(session);
          Events.emit('characterLoad', session);
        }
        else {
          // Authentication failed.
          session.prompt.displayCompletionError(session, 'Login incorrect.\n');
        }
      });
    }
    else {
      // Salt not found, this suggests the character name doesn't exist.
      session.prompt.displayCompletionError(session, 'Login incorrect.\n');
    }
  });
}

/**
 * Load additional character details like stats, spell effects, and item inventory.
 */
characters.prototype.loadCharacterDetails = function(session) {
  var character = session.character;
  // Unpack stored properties
  session.character.stats = JSON.parse(character.stats);
  session.character.effects = JSON.parse(character.effects);
  session.character.equipment = JSON.parse(character.equipment);
  session.character.perms = JSON.parse(character.perms);
  session.character.inventory = JSON.parse(character.inventory);

  var values = {
    containerType: 'player_inventory',
    parentId: character.id
  }

  // Raw socket write is used here since the command prompt will be displayed after "look" runs.
  session.socket.write('Welcome back ' + character.name + '\n');
  session.inputContext = 'command';
  Commands.triggers.look(session, '');
}

/**
 * Create an empty data structure to hold character equipment.
 */
characters.prototype.initializeEqSlots = function() {
  var slotKeys = Object.keys(Config.equipmentSlots);
  var equipment = {};
  var slot = '';

  for (var i = 0; i < slotKeys.length; ++i) {
    slot = Config.equipmentSlots[slotKeys[i]];
    equipment[slot] = false;
  }
  return equipment;
}

/**
 * Character creation prompt.
 */
characters.prototype.createCharacter = function(session) {
  var createCharacterPrompt = Prompt.new(session, this.saveNewCharacter, 'createCharacter');
  createCharacterPrompt.quittable = false;

  var saltField = createCharacterPrompt.newField('value');
  saltField.name = 'salt';
  saltField.value = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
  createCharacterPrompt.addField(saltField);

  var characterNameField = createCharacterPrompt.newField('text');
  characterNameField.name = 'charactername';
  characterNameField.validate = this.validateCharacterName;
  characterNameField.formatPrompt('Character Name:\n');
  createCharacterPrompt.addField(characterNameField);

  var passwordField = createCharacterPrompt.newField('text');
  passwordField.name = 'password';
  passwordField.formatPrompt('Password:\n');
  createCharacterPrompt.addField(passwordField);

  createCharacterPrompt.start();
}

/**
 * Password hashing routine.
 *
 * @param salt
 *   Password salt
 *
 * @param password
 *   Password to hash
 *
 * @return
 *   Returns a hash of the combination of salt and password.
 */
characters.prototype.passHash = function(salt, password) {
  var hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('hex');
}

/**
 * Completion callback for character creation screen.
 *
 * @param session
 *   user session object
 *
 * @param fieldValues
 *   user input values from character creation screen.
 */
characters.prototype.saveNewCharacter = function(session, fieldValues) {
  var Character = Models.Character;
  var hashedPassword = Characters.passHash(fieldValues.salt, fieldValues.password);

  var values = {
    name: fieldValues.charactername,
    pass: hashedPassword,
    salt: fieldValues.salt,
    last_login: 0,
    status: 1,
    current_room: Config.startRoomId,
    perms: JSON.stringify([]),
    stats: JSON.stringify({}),
    effects: Characters.startEffects(), equipment: JSON.stringify(Characters.initializeEqSlots()),
    inventory: JSON.stringify([])
  };

  Character.create(values).then(function(instance) {
    // Attach character to active session.
    session.character = instance.dataValues;
    session.socket.write('Welcome ' + values.name + '\n');
    session.inputContext = 'command';
    Commands.triggers.look(session, '');
  });
}

/**
 * If a character should begin the game with starting spell effects
 * this is how they are applied.
 */
characters.prototype.startEffects = function() {
  // Currently no starting affects, will add
  // sustain and others as needed later.
  return JSON.stringify({sustain:500});
}

/**
 * Test if a given character name is already in use.
 *
 * @param session
 *   Session object
 *
 * @param name
 *   String containing the character name to look for.
 *
 * @return
 *   Returns boolean: false if character name is already in use, otherwise true.
 */
characters.prototype.validateCharacterName = function(session, name) {

  if (name.length === 0) {
    session.prompt('Character Name:\n', 'name');
    return false;
  }

  var Character = Models.Character;

  Character.findOne({attributes:['id'],where: {name:name}}).then(function (character) {
    // Since we can't just return true or false from the parent function
    // there's some manual form handling that has to take place.
    if (character !== null) {
      var message = name + ' is already in use. Please select a different character name.\n';
      session.socket.write(message);
      this.promptUser(session.prompt.currentField);
    }
    else {
      session.prompt.currentField.cacheInput(name);
      var fieldIndex = session.prompt.getFieldIndex(session.prompt.currentField.name);
      session.prompt.currentField = session.prompt.fields[fieldIndex + 1];
      session.prompt.promptUser();
    }
  });
  return null;
}

/**
 * Search current active characters by character name.
 *
 * @param name
 *   Character name (or name fragment) to search for.
 *
 * @return
 *  If found returns the session object of the character found.
 *  Otherwise returns false;
 */
characters.prototype.searchActiveCharactersByName = function(name) {
  for (var i = 0; i < Sessions.length; ++i) {
    var session = Sessions[i];
    if (session.character.name.startsWith(name)) {
      return session;
    }
  }
  return false;
}

/**
 * Check character for permission.
 *
 * @param session
 *   session object
 *
 * @param perm
 *   permission flag to check for (ex. ADMIN)
 */
characters.prototype.hasPerm = function(session, perm) {
  return session.character.perms.includes(perm);
}

module.exports = new characters();
