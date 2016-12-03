// user stuff
var crypto = require('crypto');

module.exports.login = function(socket, input) {
  var field = socket.playerSession.expectedInput;
  socket.playerSession[field] = input;
  
  if (socket.playerSession.expectedInput === 'user') {
    socket.playerSession.prompt('Password:\n', 'pass');
    return;
  }

  if (socket.playerSession.expectedInput === 'pass') {
    // authenticate
    socket.write('Welcome back ' + socket.playerSession.user);
    socket.playerSession.mode = 'command';
    return;
  }

  if (socket.playerSession.user === false) {
    socket.write('Character Name:\n');
    socket.playerSession.expectedInput = 'user';
    return;
  }
}

module.exports.create = function(socket, connection, input) {
  if (socket.playerSession.expectedInput === 'name') {
    socket.playerSession.name = input;
    var nameExists = characterNameExists(input, connection);
    console.log('nameExists:');
    console.log(typeof nameExists);
    console.log(nameExists);
    if (characterNameExists(input, connection) === true) {
      socket.write(input + ' is already in use. Please try a different character name.');
      socket.write('Character Name:\n');
      return;
    }
    socket.write('Password:\n');
    socket.playerSession.expectedInput = 'pass';
    return;
  }
  if (socket.playerSession.expectedInput === 'pass') {
    socket.playerSession.pass = input;
    console.log(socket.playerSession);
    createCharacter(socket, connection);
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

function createCharacter(socket, connection) {
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
    status: 1,
  };
  console.log(values);
  connection.query('INSERT INTO characters SET ?', values, function (error, result) {});
}

function characterNameExists(name, connection, socket) {

  connection.query('SELECT id FROM characters WHERE name = ?', [name],
    function(error, results, fields) {
      if (results.length !== 0) {
        var message = name + ' is already in use. Please select a different character name.\n';
        socket.playerSession.prompt('Character Name:\n', 'name');
        return;
      }
    }
  );
}
