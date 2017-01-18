var Command = function() {
  this.trigger = 'arch';
  this.permsRequired = 'BUILDER';
  this.helpText = 'Access the administrator console';
  this.callback = function (session, input) {
    session.nogossip = true;
    session.write('You summon an admin terminal.');
    session.socket.write(Tokens.replace(`
%green%ClearAsMUD 1.0 Admin Terminal%green%
%green%=============================%green%
`));
    Admin.listTasks(session);
  }
}

module.exports = new Command();
