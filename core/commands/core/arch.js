var Command = function() {
  this.trigger = 'arch';
  this.permsRequired = 'BUILDER';
  this.helpText = 'Access the administrator console';
  this.callback = function (session, input) {
    // set NOGOSSIP flag on character session
    session.nogossip = true;

    // change command handler to arch for the duration of this session
    session.inputContext = 'arch';
    // Display activity dashboard
      // total logged in players
      // runtime
      // room count in memory

    // Display arch console options prompt
      // Connfiguration
      // Display Logs
      // Character permissions(?)
      // Modules
        // list
        // enable
        // disable

  }

}

module.exports = new Command();
