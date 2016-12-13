// user stuff

var crypto = require('crypto');
// Session mode handler for login

var user = function(){};


user.prototype.start = function(socket) {
  var message = colors.green('Welcome to ' + global.config.mudName + "\n");
  // TODO: display splash screen.
  var startPrompt = prompt.new(socket, global.user.startSwitch);
  var startField = startPrompt.newField('select');
  console.log('startfield');
  console.log(startField);
  startField.name = 'start';
  startField.options = {l:'l', c:'c', q:'q'};
  startField.promptMessage = startField.formatPrompt('[::l::]og in, [::c::]reate a character, or [::q::]uit', true);
  startField.startField = true;
  startPrompt.addField(startField);

  startPrompt.start();
}


/**
 * Start screen prompt callback
 *
 * Switches between login and character creation modes based
 * on user input on the start screen.
 *
 * @param socket
 *   Socket object for the current user.
 *
 * @param fieldValues
 *   user-submitted values for the start prompt
 *
 */
user.prototype.startSwitch = function(socket, fieldValues) {
  console.log('field values:');
  console.log(fieldValues);
  input = fieldValues.start;
  if (input === 'l') {
    global.user.login(socket);
  }
  else if  (input === 'c') {
    global.user.createCharacter(socket);
  }
  else if (input === 'q') {
    global.commands.quit(socket, false);
  }
}

/**
 * Login screen prompt.
 */
user.prototype.login = function(socket) {
  console.log('login prompt build');
  var loginPrompt = prompt.new(socket, this.loginAuthenticate);
  var loginField = loginPrompt.newField('text');
  loginField.name = 'username';
  loginField.startField = true;
  loginField.promptMessage = loginField.formatPrompt('Character Name:');
  console.log('login field:');
  console.log(loginField);
  loginPrompt.addField(loginField);

  var passwordField = loginPrompt.newField('text');
  passwordField.name = 'password';
  passwordField.promptMessage = passwordField.formatPrompt('Password:');
  loginPrompt.addField(passwordField);

  loginPrompt.start();
}

/**
 * Login prompt completion handler.
 */
user.prototype.loginAuthenticate = function(socket, fieldValues) {
  var userName = fieldValues.username;
  // This is getting rammed through a hashing function so there is no need to escape.
  var password = fieldValues.password;
  var sql = "SELECT salt FROM ?? WHERE ?? = ?";
  var inserts = ['characters', 'name', fieldValues.username];
  sql = global.mysql.format(sql, inserts);
  socket.connection.query(sql, function(err, results, fields) {
    if (results.length !== 0) {
      var salt = results[0].salt;
      var passwordHash = global.user.passHash(salt, password);
      var sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
      var inserts = ['characters', 'name', userName, 'pass', passwordHash];
      sql = global.mysql.format(sql, inserts);
      socket.connection.query(sql, function(err, results, fields) {
        if (results.length !== 0) {
          var character = results[0];
          socket.playerSession.character = character;
          socket.playerSession.character.currentRoom = character.current_room;
          global.user.loadCharacterDetails(socket);
        }
        else {
          // authentication failed, throw error and reset prompt. (add reset method to prompt class)
          socket.playerSession.prompt.completionError(socket, 'Login incorrect.\n');
        }
      });
    }
    else {
      // TODO: throw error and reset prompt. (add reset method to prompt class)
      socket.playerSession.prompt.completionError(socket, 'Login incorrect.\n');
    }
  });
  //socket.write('Welcome back ' + username + '\n');
  //socket.playerSession.inputContext = 'command';
}

user.prototype.loadCharacterDetails = function(socket) {
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
  global.items.loadInventory(socket, values);
  // Load current character room if needed.
  global.rooms.loadRoom(socket, character.current_room, false);
  socket.write('Welcome back ' + character.name + '\n');
  socket.playerSession.inputContext = 'command';
}

user.prototype.createCharacter = function(socket) {
    var createCharacterPrompt = prompt.new(socket, this.saveCharacter);

    var characterNameField = createCharacterPrompt.newField();
    characterNameField.name = 'name';
    characterNameField.type = 'text';
    characterNameField.startField = true;
    characterNameField.inputCacheName = 'username';
    characterNameField.validationCallback = this.validateCharacterName;
    characterNameField.promptMessage = 'Character Name:\n';
    createCharacterPrompt.addField(characterNameField);

    var passwordField = createCharacterPrompt.newField();
    passwordField.name = 'password';
    passwordField.type = 'text';
    passwordField.inputCacheName = 'password';
    passwordField.promptMessage = 'Password:\n';
    createCharacterPrompt.addField(passwordField);

    var classField = createCharacterPrompt.newField();
    classField.name = 'characterclass';
    classField.type = 'select';
    classField.options = global.classes.selectionOptions();
    classField.inputCacheName = 'characterclass';
    classField.promptMessage = global.classes.selectionPrompt();
    createCharacterPrompt.addField(classField);
    createCharacterPrompt.setActivePrompt(createCharacterPrompt);

}

user.prototype.passHash = function(salt, password) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');

  }

// Save character record.
user.prototype.saveCharacter = function(socket, fieldValues) {
    var salt = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
    // I do not currently understand why this.passHash doesn't work
    var hashedPassword = global.user.passHash(salt, fieldValues.password);
    var values = {
      name: fieldValues.name,
      pass: hashedPassword,
      salt: salt,
      last_login: 0,
      status: 1,
      current_room: global.config.startRoomId,
      stats: global.user.startProperties(fieldValues.characterclass),
      affects: global.user.startAffects,
    };
    console.log(values);
    socket.connection.query('INSERT INTO characters SET ?', values, function (error, result) {
      characterId = result.insertId;
      // TODO: update session with character
      // TODO: generate default inventory
      // TODO: set default room number
      socket.write('Welcome ' + values.name + '\n');
      socket.playerSession.inputContext = 'command';
      global.user.changeRoom(socket, global.config.startRoom);
      // TODO: run "look"
    });
}

user.prototype.startProperties = function(characterClass) {
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
    current_room: global.config.startRoom
  }
  console.log('properties:');
  console.log(properties);
  return JSON.stringify(properties);
}

user.prototype.startAffects = function() {
  // Currently no starting affects, will add
  // sustain and others as needed later.
  return JSON.stringify({});
}

 // Validate character name input
 user.prototype.validateCharacterName = function(socket, name) {
    if (name.length === 0) {
      socket.playerSession.prompt('Character Name:\n', 'name');
    }
    socket.connection.query('SELECT id FROM characters WHERE name = ?', [name],
      function(error, results, fields) {
        if (results.length !== 0) {
          var message = name + ' is already in use. Please select a different character name.\n';
          socket.playerSession.prompt.validationError(message);
          return;
        }
        else {
          socket.playerSession.prompt.validationSuccess('name', name);
        }
      }
    );
}

module.exports = new user();
