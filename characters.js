// user stuff

var crypto = require('crypto');
// Session mode handler for login

var Characters = function(){


  /**
   * Login screen prompt.
   */
  this.login = function(socket) {

    var loginPrompt = prompt.new(socket, this.loginAuthenticate);
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
  this.loginAuthenticate = function(socket, fieldValues) {
    var userName = fieldValues.username;
    var password = fieldValues.password;
    var sql = "SELECT salt FROM ?? WHERE ?? = ?";
    var inserts = ['characters', 'name', fieldValues.username];
    sql = global.mysql.format(sql, inserts);
    socket.connection.query(sql, function(err, results, fields) {
      if (results.length !== 0) {
        var salt = results[0].salt;
        var passwordHash = global.characters.passHash(salt, password);
        var sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
        var inserts = ['characters', 'name', userName, 'pass', passwordHash];
        sql = global.mysql.format(sql, inserts);
        socket.connection.query(sql, function(err, results, fields) {
          if (results.length !== 0) {
            var character = results[0];
            socket.playerSession.character = character;
            socket.playerSession.character.currentRoom = character.current_room;
            global.characters.loadCharacterDetails(socket);
          }
          else {
            // authentication failed, throw error and reset prompt. (add reset method to prompt class)
            socket.playerSession.prompt.displayCompletionError(socket, 'Login incorrect.\n');
          }
        });
      }
      else {
        // TODO: throw error and reset prompt. (add reset method to prompt class)
        socket.playerSession.prompt.displayCompletionError(socket, 'Login incorrect.\n');
      }
    });
  }

  this.loadCharacterDetails = function(socket) {
    var character = socket.playerSession.character;
    // Unpack stored properties
    socket.playerSession.character.stats = JSON.parse(character.stats);
    socket.playerSession.character.affects = JSON.parse(character.affects);
    // Initialize empty inventory and then load
    socket.playerSession.character.inventory = {};
    var values = {
      containerType: 'player_inventory',
      parentId: character.id
    }
    global.items.loadInventory(values, socket);
    // Load current character room if needed.
    socket.write('Welcome back ' + character.name + '\n');
    socket.playerSession.inputContext = 'command';
    global.commands.triggers.look(socket, '');
  }

  /**
   * Character creation prompt.
   */
  this.createCharacter = function(socket) {
    var createCharacterPrompt = prompt.new(socket, this.saveCharacter);
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
  this.saveCharacter = function(socket, fieldValues) {
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

    socket.connection.query('INSERT INTO characters SET ?', values, function (error, result) {
      characterId = result.insertId;
      // TODO: generate default inventory
      socket.playerSession.character = values;
      socket.playerSession.character.id = characterId;
      socket.playerSession.character.currentRoom = global.config.startRoom;

      socket.write('Welcome ' + values.name + '\n');
      socket.playerSession.inputContext = 'command';
      global.commands.triggers.look(socket, '');
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
 this.validateCharacterName = function(socket, name) {
   if (name.length === 0) {
     socket.playerSession.prompt('Character Name:\n', 'name');
   }
   socket.connection.query('SELECT id FROM characters WHERE name = ?', [name],
     ret = function(error, results, fields) {
     if (results.length !== 0) {
       var message = name + ' is already in use. Please select a different character name.\n';
         socket.playerSession.error(message);
         return false;
       }
       else {
         return true;
       }
     });
    return ret;
  }

  this.searchActiveCharactersByName = function(name) {
    for (i = 0; i < global.sockets.length; ++i) {
      check = global.sockets[i];
      if (check.playerSession.character.name.startsWith(name)) {
        return check.playerSession.character.id;
      }
    }
    return false;
  }
}

module.exports = new Characters();
