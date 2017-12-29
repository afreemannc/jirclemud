/**
 * @file Combat API,
 * rovides a framework of events that game mechanics modules can tap into to implement a working combat system.
 */

module.exports.new = function () {
  // list of participants
  this.id = 'combat' + new Date().getTime();
  this.participants = {
    mobs:[],
    players:[]
  }
  // start event
  this.start = function() {
    // create event queue
    var tic = Tics.addQueue('combat' + this.id, combatTicInterval);

    tic.event.on('combat' + this.id, function() {
      this.combatRound();
    });
    Tics.startQueue('combat' + this.id);
  }
  // method for adding participants
  this.addParticipant = function(type, participant) {
    if (typeof this.participants[type] !== 'undefined') {
      this.participants[type].push(participant);
      // TODO: emit combat join event for participant.
    }
  }
  // mentod for removing participants (flee, teleport, summoned away, dead, etc)
  this.removeParticipant = function(type, participant) {
    if (typeof this.participants[type] !== 'undefined') {
      var index = this.participants[type].indexOf(participant);
      this.participants[type].splice(index, 1);
      // TODO: emit combat exit event for participant.
    }
  }

  this.combatRound = function() {
    // TODO: (somewhere)
    // - process input queue (if needed)
    // -- if input is lagged by a command this turn skip
    // -- process queue one input at a time until end is reached or a combat command is encountered.
    //
    // - handle base attacks
    // - handle any executed commands/skills as needed
  }

  // method to end combat
  this.end = function() {
    // TODO: halt combat queue.
    // TODO: emit combat end event for participants
  }

  // update input parser for the following:
    // method for creating input queue and setting queue flag, turn skip count
    // method for parsing contents of input queue
  // Update commands for the following:
   // add validation routine to call if "COMBAT" flag is set
   // add skip code/message if validation fails
   // add support for turn skip/lag count on combat commands
  // end event
});
