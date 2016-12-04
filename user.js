// user stuff

var crypto = require('crypto');
var config = require('./config');
var prompt = require('./prompt');
// Session mode handler for login

var user = function() {

  this.start = function(socket) {
  var message = 'Welcome to ' + config.mudName + "\n";
  // TODO: display splash screen.
  message += "[L]ogin or [C]reate a character\n";
  var startPrompt = prompt.new(socket);
  var startField = {
    name: 'start',
    startField: true,
    inputCacheName: 'start',
    promptMessage: message,
    validationCallback: 'validateStartPrompt'
  }
  startPrompt.addField(startField);
  startPrompt.context = 'user';
  socket.playerSession.prompt = startPrompt;
  startPrompt.start();
}


  this.validateStartPrompt = function(socket, data) {
  input = data.toString().replace(/(\r\n|\n|\r)/gm,"");
  if (input === 'l' || input === 'L') {
    this.login(socket);
  }
  else if  (input === 'c' || input === 'C') {
    this.create(socket, true);
  }
  else {
    var message = input + ' is not a valid option\n';
    message += "[L]og in or [C]reate a character\n";
    socket.write(message);
  }
}
};

user.prototype.login = function(socket) {
  var loginPrompt = prompt.new(socket);
  var loginField = {
    name: 'username',
    startField: true,
    inputCacheName: 'username',
    promptMessage: 'Character Name:\n',
    nextField: 'password',
  }
  loginPrompt.addField(loginField);

  var passwordField = {
    name: 'password',
    inputCacheName: 'password',
    promptMessage: 'Password:\n',
    validationCallback: 'loginAuthenticate',
    nextField: false,
  }
  loginPrompt.addField(passwordField);
  socket.playerSession.prompt = loginPrompt;
  loginPrompt.start();
}

user.prototype.loginAuthenticate = function(socket, connection) {
  var username = socket.playerSession.prompt.fields.username.value;
  var passwword = socket.playerSession.prompt.fields.password.value;
  // TODO: authenticate
  socket.write('Welcome back ' + username + '\n');
  socket.playerSession.inputContext = 'command';
  delete socket.playerSession.prompt;
}


module.exports = new user();


  // Session mode handler for character creation
  function create(socket, connection, input) {
    if (socket.playerSession.expectedInput === 'name') {
      socket.playerSession.name = input;
      validateCharacterName(input, connection, socket);
      return;
    }
    if (socket.playerSession.expectedInput === 'pass') {
      socket.playerSession.pass = input;
      saveCharacter(socket, connection);
      socket.write('character saved');
      socket.playerSession.mode = 'command';
      return;
    }
    if (socket.playerSession.user === false) {
      socket.write('Character Name:\n');
      socket.playerSession.expectedInput = 'name';
      return;
    }
  }

  // Save character record.
  function saveCharacter(socket, connection) {
    console.log(socket.playerSession);
    var salt = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
    var hash = crypto.createHmac('sha512', salt);
    hash.update(socket.playerSession.pass);
    var passHash = hash.digest('hex');
    console.log(passHash);
    var values = {
      name: socket.playerSession.name,
      pass: passHash,
      salt: salt,
      last_login: 0,
      status: 1
    };
    console.log(values);
    connection.query('INSERT INTO characters SET ?', values, function (error, result) {});
  }

  // Validate character name input
  function validateCharacterName(name, connection, socket) {
    if (name.length === 0) {
      socket.playerSession.prompt('Character Name:\n', 'name');
    }
    connection.query('SELECT id FROM characters WHERE name = ?', [name],
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

