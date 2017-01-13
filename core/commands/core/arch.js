var Command = function() {
  this.trigger = 'arch';
  this.permsRequired = 'BUILDER';
  this.helpText = 'Access the administrator console';
  this.callback = function (session, input) {
    session.nogossip = true;
    session.inputContext = 'arch';
    session.write('');
  }
}

module.exports = new Command();
