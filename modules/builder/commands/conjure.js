var Command = function() {
  this.trigger = 'conjure';
  this.permsRequired = 'BUILDER';
  this.helpText = `
  Conjure lets you create an instance of an item.

  %yellow%Usage:%yellow%
         conjure <item id>

  %yellow%Usage:%yellow%
         > conjure 11
         >
         > %bold%You conjure up a loaf of bread.%bold%
         >
         > inventory
         >
         > %bold%You are carrying:%bold%
         > a loaf of bread
  `;
  this.callback = function (session, input) {
    var Item = Models.Item;
    Item.findOne({where: {iid: input}}).then(function(instance) {
      if (instance) {
        var item = instance.dataValues;
        var roomId = session.character.current_room;
        item.properties = JSON.parse(item.properties);
        session.character.inventory.push(item);
        session.write('You conjure up a ' + item.name);
        Rooms.message(session, session.character.name + ' conjures up a ' + item.name, roomId, true);
        Commands.triggers.inventory(session, false);
      }
      else {
        session.write('No item exists with the ID supplied. Check the item id of the item you want and try again.');
        return false;
      }
    });
  }

}

module.exports = new Command();
