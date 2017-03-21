/**
 * @file Combat API,
 * rovides a framework of events that game mechanics modules can tap into to implement a working combat system.
 */

module.exports.new = function () {
  // list of participants
  this.participants = {
    mobs:[],
    players:[]
  }
  // start event
  this.start = function() {

  }
  // method for adding participants
  this.addParticipant = function(type, participant) {
    if (typeof this.participants[type] !== 'undefined') {
      this.participants[type].push(participant);
    }
  }
  // mentod for removing participants (flee, teleport, summoned away, dead, etc)

  // method to iterate participant list and fire base attack event
  this.combatRound = function() {

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


modile.exports.end = function() {
  // unset combat flag on all participants

  // parse contents of input queues and unset queue flag
  // end event
  // delete combat object
}
