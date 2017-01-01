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
            session.prompt.displayCompletionError(socket, 'Login incorrect.\n');
          }
        });
      }
      else {
        // TODO: throw error and reset prompt. (add reset method to prompt class)
        session.prompt.displayCompletionError(socket, 'Login incorrect.\n');
      }
    });
  }

  this.loadCharacterDetails = function(session) {
    var character = session.character;
    // Unpack stored properties
    session.character.stats = JSON.parse(character.stats);
    session.character.affects = JSON.parse(character.affects);
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
    global.commands.triggers.look(session, '');
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
      current_room: global.config.startRoomId,
      stats: this.startProperties(fieldValues.characterclass),
      affects: this.startAffects,
    };

    global.dbPool.query('INSERT INTO characters SET ?', values, function (error, result) {
      characterId = result.insertId;
      // TODO: generate default inventory
      session.character = values;
      session.character.id = characterId;
      session.character.currentRoom = global.config.startRoom;
      // TODO: move this somewhere else.
      session.socket.write('Welcome ' + values.name + '\n');
      session.inputContext = 'command';
      global.commands.triggers.look(session, '');
    });
  }

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
      current_room: global.config.startRoom
    }
    // TODO: add stats based on stat system
    // TODO: add currency placeholders based on currency system
    return JSON.stringify(properties);
  }

  this.startAffects = function() {
    // Currently no starting affects, will add
    // sustain and others as needed later.
    return JSON.stringify({sustain:500});
  }

  // Validate character name input
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

  this.searchActiveCharactersByName = function(name) {
    for (i = 0; i < global.sessions.length; ++i) {
      check = global.sessions[i];
      if (check.character.name.startsWith(name)) {
        return check.character.id;
      }
    }
    return false;
  }
}

module.exports = new Characters();
