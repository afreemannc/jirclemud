// user stuff

var crypto = require('crypto');
var prompt = require('./prompt');
// Session mode handler for login

var user = function(){};


user.prototype.start = function(socket) {
  var message = colors.green('Welcome to ' + global.config.mudName + "\n");
  // TODO: display splash screen.
  message += "[::1::]ogin, [::2::]reate a character or [::3::]uit.\n";
  var startPrompt = prompt.new(socket, global.user.startSwitch);
  var startField = startPrompt.newField();
  startField.name = 'start';
  startField.type = 'select';
  startField.options = ['l','c','q'];
  startField.startField = true;
  startField.inputCacheName = 'start';
  startField.promptMessage = message;
  startPrompt.addField(startField);

  startPrompt.setActivePrompt(startPrompt);
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
  input = fieldValues.start;
  if (input === 'l' || input === 'L') {
    global.user.login(socket);
  }
  else if  (input === 'c' || input === 'C') {
    global.user.createCharacter(socket);
  }
  else if (input === 'q' || input === 'Q') {
    global.commands.quit(socket, false);
  }
}

/**
 * Login screen prompt.
 */
user.prototype.login = function(socket) {
  var loginPrompt = prompt.new(socket, this.loginAuthenticate);
  var loginField = loginPrompt.newField();
  loginField.name = 'username';
  loginField.type = 'text';
  loginField.startField = true;
  loginField.inputCacheName = 'username';
  loginField.promptMessage = 'Character Name:\n';
  loginPrompt.addField(loginField);

  var passwordField = loginPrompt.newField();
  passwordField.name = 'password';
  passwordField.type = 'text';
  passwordField.inputCacheName = 'password';
  passwordField.promptMessage = 'Password:\n';
  loginPrompt.addField(passwordField);

  loginPrompt.setActivePrompt(loginPrompt);
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
          character.properties = JSON.parse(character.properties);
          console.log(character);
          socket.playerSession.character = character;
          socket.write('Welcome back ' + character.name + '\n');
          socket.playerSession.inputContext = 'command';
          global.user.changeRoom(socket, character.properties.room);
          // load additional character properties (inventory, class details, stats, etc)
        }
        else {
          // authentication failed, throw error and reset prompt. (add reset method to prompt class)
        }
      });
    }
    else {
      // TODO: throw error and reset prompt. (add reset method to prompt class)
    }
  });
  //socket.write('Welcome back ' + username + '\n');
  //socket.playerSession.inputContext = 'command';
}

user.prototype.loadCharacter = function(socket, id) {
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
      properties: global.user.startProperties(fieldValues.characterclass)
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
    room: global.config.startRoom,
    skills:[],
    spells:[]
  }
  console.log('properties:');
  console.log(properties);
  return JSON.stringify(properties);
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

user.prototype.changeRoom = function(socket, roomId) {
  global.rooms.loadRoom(socket, roomId, global.commands.look);
}

module.exports = new user();
