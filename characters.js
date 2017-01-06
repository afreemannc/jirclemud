// user stuff

var crypto = require('crypto');
// Session mode handler for login

var Characters = function(){

  /**
   * Login screen prompt.
   */
  this.login = function(session) {

    var loginPrompt = prompt.new(session, this.loginAuthenticate);
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
   * Login prompt completion handler.
   */
  this.loginAuthenticate = function(session, fieldValues) {
    var userName = fieldValues.username;
    var password = fieldValues.password;
    var sql = "SELECT salt FROM ?? WHERE ?? = ?";
    var inserts = ['characters', 'name', fieldValues.username];
    sql = global.mysql.format(sql, inserts);
    global.dbPool.query(sql, function(err, results, fields) {
      if (results.length !== 0) {
        var salt = results[0].salt;
        var passwordHash = global.characters.passHash(salt, password);
        var sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
        var inserts = ['characters', 'name', userName, 'pass', passwordHash];
        sql = global.mysql.format(sql, inserts);
        global.dbPool.query(sql, function(err, results, fields) {
          if (results.length !== 0) {
            var character = results[0];
            session.character = character;
            session.character.currentRoom = character.current_room;
            global.characters.loadCharacterDetails(session);
          }
          else {
            // authentication failed, throw error and reset prompt. (add reset method to prompt class)
            session.prompt.displayCompletionError(session, 'Login incorrect.\n');
          }
        });
      }
      else {
        // TODO: throw error and reset prompt. (add reset method to prompt class)
        session.prompt.displayCompletionError(session, 'Login incorrect.\n');
      }
    });
  }

  /**
   * Load additional character details like stats, spell effects, and item inventory.
   */
  this.loadCharacterDetails = function(session) {
    var character = session.character;
    // Unpack stored properties
    session.character.stats = JSON.parse(character.stats);
    session.character.affects = JSON.parse(character.affects);
    // Initialize empty equipment slots and then load
    session.character.equipment = global.characters.initialzeEqSlots();
    // TODO: load saved equipment

    // Initialize empty inventory and then load
    session.character.inventory = {};
    var values = {
      containerType: 'player_inventory',
      parentId: character.id
    }
    global.containers.loadInventory(values, session);
    // Raw socket write is used here since the command prompt will be displayed after "look" runs.
    session.socket.write('Welcome back ' + character.name + '\n');
    session.inputContext = 'command';
    Commands.triggers.look(session, '');
  }

  /**
   * Create an empty data structure to hold character equipment.
   */
  this.initialzeEqSlots = function() {
    var slotKeys = Object.keys(config.equipmentSlots);
    var equipment = {};
    var slot = '';

    for (var i = 0; i < slotKeys.length; ++i) {
      slot = config.equipmentSlots[slotKeys[i]];
      equipment[slot] = false;
    }
    return equipment;
  }

  /**
   * Character creation prompt.
   */
  this.createCharacter = function(session) {
    var createCharacterPrompt = prompt.new(session, this.saveCharacter);
    createCharacterPrompt.quittable = false;

    var characterNameField = createCharacterPrompt.newField('text');
    characterNameField.name = 'charactername';
    characterNameField.validate = this.validateCharacterName;
    characterNameField.formatPrompt('Character Name:\n');
    createCharacterPrompt.addField(characterNameField);

    var passwordField = createCharacterPrompt.newField('text');
    passwordField.name = 'password';
    passwordField.formatPrompt('Password:\n');
    createCharacterPrompt.addField(passwordField);

    var classField = createCharacterPrompt.newField('select');
    classField.name = 'characterclass';
    classField.options = global.classes.selectionOptions();
    classField.formatPrompt('Please select a character class:');
    createCharacterPrompt.addField(classField);

    createCharacterPrompt.start();;
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
  this.passHash = function(salt, password) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
  }


  // Save character record.
  // TODO: convert to Promise
  this.saveCharacter = function(session, fieldValues) {
    var salt = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
    // TODO: unfuck this function so it works for inserts and updates.
    var hashedPassword = this.passHash(salt, fieldValues.password);
    var values = {
      name: fieldValues.charactername,
      pass: hashedPassword,
      salt: salt,
      last_login: 0,
      status: 1,
      current_room: Config.startRoomId,
      stats: this.startProperties(fieldValues.characterclass),
      affects: this.startAffects,
    };

    global.dbPool.query('INSERT INTO characters SET ?', values, function (error, result) {
      characterId = result.insertId;
      // TODO: generate default inventory
      session.character = values;
      session.character.id = characterId;
      session.character.currentRoom = Config.startRoom;
      // TODO: move this somewhere else.
      session.socket.write('Welcome ' + values.name + '\n');
      session.inputContext = 'command';
      Commands.triggers.look(session, '');
    });
  }

  /**
   * Build starting character properties based on initial class selection during character creation.
   */
  this.startProperties = function(characterClass) {
    // TODO: implement some kind of stat system. Probably standard D20 style to start.
    var characterClass = global.classes.classFromSelection(characterClass);
    // TODO: add con bonus once stats are implemented.
    var startingHP = global.dice.roll(characterClass.hitDice);
    var startingMana = 10; //TODO: implement some mana thing once casters are in.
    var properties = {
      class: characterClass.name,
      class_level: 1,
      maxhp: startingHP,
      currenthp: startingHP,
      maxmana: startingMana,
      currentmana: startingMana,
      xp: 1,
      current_room: Config.startRoom
    }
    // TODO: add stats based on stat system
    // TODO: add currency placeholders based on currency system
    return JSON.stringify(properties);
  }

  /**
   * If a character should begin the game with starting spell effects
   * this is how they are applied.
   */
  this.startAffects = function() {
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
  this.validateCharacterName = function(session, name) {
    if (name.length === 0) {
      session.prompt('Character Name:\n', 'name');
      return false;
    }
    global.dbPool.query('SELECT id FROM characters WHERE name = ?', [name],
      ret = function(error, results, fields) {
      if (results.length !== 0) {
        var message = name + ' is already in use. Please select a different character name.\n';
        session.error(message);
        return false;
      }
      else {
       return true;
      }
    });
    return ret;
  }

  /**
   * Search current active characters by character name.
   *
   * @param name
   *   Character name (or name fragment) to search for.
   *
   * @return
   *  If found returns the numeric character id of the character found.
   *  Otherwise returns false;
   */
  this.searchActiveCharactersByName = function(name) {
    for (var i = 0; i < Sessions.length; ++i) {
      check = Sessions[i];
      if (check.character.name.startsWith(name)) {
        return check.character.id;
      }
    }
    return false;
  }
}

module.exports = new Characters();
