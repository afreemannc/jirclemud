// user stuff

var crypto = require('crypto');
var config = require('./config');
var prompt = require('./prompt');
// Session mode handler for login

var user = function(){};


user.prototype.start = function(socket) {
  var message = 'Welcome to ' + config.mudName + "\n";
  // TODO: display splash screen.
  message += "[L]ogin or [C]reate a character\n";
  var startPrompt = prompt.new(socket, global.user.startSwitch);
  var startField = startPrompt.newField();
  startField.name = 'start';
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
  input = fieldValues.start.toString().replace(/(\r\n|\n|\r)/gm,"");
  if (input === 'l' || input === 'L') {
    global.user.login(socket);
  }
  else if  (input === 'c' || input === 'C') {
    global.user.create(socket, true);
  }
  else {
    // TODO: move this to a validation callback
    var message = input + ' is not a valid option\n';
    message += "[L]og in or [C]reate a character\n";
    socket.write(message);
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
  // TODO: authenticate
  var sql = "SELECT salt FROM ?? WHERE ?? = ?";
  var inserts = ['characters', 'name', fieldValues.username];
  sql = global.mysql.format(sql, inserts);
  socket.connection.query(sql, function(err, results, fields) {
   //console.log('error code:' + err.code);
    if (results.length !== 0) {
      var salt = results[0].salt;
      var passwordHash = global.user.passHash(salt, password);
      console.log('passwordHash:' + passwordHash);
      var sql = "SELECT * FROM ?? WHERE ?? = ? AND ?? = ?";
      var inserts = ['characters', 'name', userName, 'pass', passwordHash];
      sql = global.mysql.format(sql, inserts);
      socket.connection.query(sql, function(err, results, fields) {
        if (results.length !== 0) {
          var character = results[0];
          console.log('character:');
          console.log(character);
          socket.playerSession.character = character;
          socket.write('Welcome back ' + character.name + '\n');
          socket.playerSession.inputContext = 'command';
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

user.prototype.createCharacter = function(socket, input) {
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

    createCharacterPrompt.setActivePrompt(loginPrompt);

}

user.prototype.passHash = function(salt, password) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');

  }

// Save character record.
user.prototype.saveCharacter = function(socket, fieldValues) {
    var salt = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
    var hashedPassword = this.passHash(salt, fieldValues.password);
    console.log(hashedPassword);
    var values = {
      name: fieldValues.name,
      pass: hashedPassword,
      salt: salt,
      last_login: 0,
      status: 1
    };
    console.log(values);
    socket.connection.query('INSERT INTO characters SET ?', values, function (error, result) {});
}

 // Validate character name input
 user.prototype.validateCharacterName = function(socket, name) {
    if (name.length === 0) {
      socket.playerSession.prompt('Character Name:\n', 'name');
    }
    socket.connection.query('SELECT id FROM characters WHERE name = ?', [name],
      function(error, results, fields) {
        console.log(results);
        if (results.length !== 0) {
          socket.playerSession.user = false;
          var message = name + ' is already in use. Please select a different character name.\n';
          message = message + 'Character Name:\n'
          socket.playerSession.prompt(message, 'name');
          return;
        }
        else {
          socket.write('Password:\n');
          socket.playerSession.expectedInput = 'pass';
          return;
        }
      }
    );
}
module.exports = new user();
