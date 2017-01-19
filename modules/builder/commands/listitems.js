var Command = function() {
  this.trigger = 'listitems';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Presents a list of items that are available in your current zone.

  %yellow%Usage:%yellow%
         listitems

  %yellow%Usage:%yellow%
         > listitems
         >
         > %bold%a loaf of bread. [2]%bold%
         > %bold%a small dagger. [3]%bold%
         > %bold%a codpiece. [4]%bold%
  `;
  this.callback = function (session, input) {
    var roomId = session.character.current_room;
    var zid = Rooms.room[roomId].zid;

    var Item = Models.Item;
    Item.findAll({where: {zid: zid}}).then(function(instances) {
      var output = 'Items currently available:\n';
      instances.forEach(function(instance) {
        if (instance) {
          var item = instance.dataValues;
          output += item.name + '[' + item.iid + ']';
        }
      });
      session.write(Tokens.replace(output));
    });
  }

}

module.exports = new Command();
