// user stuff
var crypto = require('crypto');

module.exports.login = function(socket, input) {
  if (socket.playerSession.expectedInput === 'user') {
    socket.playerSession.user = input;
    socket.write('Password:\n');
    socket.playerSession.expectedInput = 'pass';
    return;
  }

  if (socket.playerSession.expectedInput === 'pass') {
    socket.playerSession.pass = input;
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

module.exports.create = function(socket, input) {
  if (socket.playerSession.expectedInput === 'name') {
    socket.playerSession.name = input;
    socket.write('Password:\n');
    socket.playerSession.expectedInput = 'pass';
    return;
  }
  if (socket.playerSession.expectedInput === 'pass') {
    socket.playerSession.pass = input;
    createCharacter(socket.playerSession);
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

function createCharacter(session) {
  var salt = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
  var hash = crypto.createHmac('sha512', salt);
  hash.update(session.pass);
  var passHash = hash.digest('hex');
  console.log(passHash);
  var values = {
    id: '',
    name: session.name,
    pass: passHash,
    salt: salt,
    last_login: 0,
    status: 1,
  };
  console.log(values);
  //connection.query('INSERT INTO characters values (?)', values);
}
