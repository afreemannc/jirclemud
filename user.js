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



user.prototype.startSwitch = function(socket, fieldValues) {
  input = fieldValues.start.toString().replace(/(\r\n|\n|\r)/gm,"");
  if (input === 'l' || input === 'L') {
    console.log(this);
    global.user.login(socket);
  }
  else if  (input === 'c' || input === 'C') {
    global.user.create(socket, true);
  }
  else {
    var message = input + ' is not a valid option\n';
    message += "[L]og in or [C]reate a character\n";
    socket.write(message);
  }
}


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


user.prototype.loginAuthenticate = function(socket, fieldValues) {
  console.log(socket.playerSession.prompt);
  var username = fieldValues.username;
  var passwword = fieldValues.password;;
  // TODO: authenticate
  socket.write('Welcome back ' + username + '\n');
  socket.playerSession.inputContext = 'command';
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

user.prototype.passHash = function(password) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(socket.playerSession.pass);
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
