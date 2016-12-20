var Command = function() {
  this.trigger = 'arch';
  this.helpText = 'Access the administrator console';
  this.callback = function (socket, input) {
    // set NOGOSSIP flag on character session
    socket.playerSession.nogossip = true;

    // change command handler to arch for the duration of this session
    socket.playerSession.inputContext = 'arch';
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
