var Command = function() {
  this.trigger = 'placemob';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Builder only: Place a mob in the current room. Note this change is permanent and this mob will load in this location going forward.
  If you want to create a temporary copy of a mob try summon.

  %yellow%Usage:%yellow%
         placemob <mob id>

  %yellow%Usage:%yellow%
         > placemob 1
         >
         > %bold%You have added a mob to this room.%bold%
         >
         > look
         >
         > %bold% A small furry chipmunk is rooting around in some leaves.%bold%
  `;
  this.callback = function (session, input) {
    var roomId = session.character.current_room;
    var zoneId = Rooms.room[roomId].zid;

    var Mobile = Models.Mobile;
    Mobile.findOne({where: {mid: input, zid: zoneId}}).then(function(instance) {
      if (instance) {
        var MobilesInstance = Models.MobilesInstance;
        var values = {
          mid: instance.get('mid'),
          start_rid: roomId,
          name:instance.get('name'),
          description: instance.get('description'),
          stats: instance.get('stats'),
          effects: instance.get('effects'),
          equipment: instance.get('equipment'),
          inventory: instance.get('inventory'),
          extra: instance.get('extra')
        }
        MobilesInstance.create(values).then(function(mobInstance) {
          var mob = mobInstance.dataValues;
          mob.stats = JSON.parse(mob.stats);
          mob.effects = JSON.parse(mob.effects);
          mob.equipment = JSON.parse(mob.equipment);
          mob.inventory = JSON.parse(mob.inventory);
          mob.extra = JSON.parse(mob.extra);
          Rooms.room[roomId].mobiles.push(mob);
          session.write('Mobile placed.');
          Commands.triggers.look(session, '');
        });
      }
      else {
        session.write('Unable to place mob: mob id supplied is incorrect or the desired mob does not exist in this zone.');
      }
    });
  }

}

module.exports = new Command();
