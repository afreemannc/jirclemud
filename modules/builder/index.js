function Module() {
  this.name = 'Builder';
  this.description = 'In-game world building commands.'
  this.install = false;
  this.features = ['commands', 'prompts'];
  this.load = function() {
    // Implement BUILDER perm

    // Overrride room display methods so output can be altered in response to BUILDER perm
    Rooms.displayRoomName = function(room, session) {
      if (!Characters.hasPerm(session, 'BUILDER') && !Character.hasPerm(session, 'ADMIN')) {
        return "\n%bold%%room.name%%bold%\n";
      }
      else {
        return "\n%bold%%room.name%%bold% %green%[rid:%room.rid%]%green%\n";
      }
    }
  }
}

module.exports = new Module();
