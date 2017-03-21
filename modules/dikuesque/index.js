function Module() {
  this.name = 'Dikuesque';
  this.description = 'Game mechanics loosely patterned off of DikuMud.'
  this.install = false;
  this.features = ['commands'];
  this.load = function() {
    console.log('added listener to prompt events');
    Events.on('prompt:createCharacter', function(characterCreationPrompt) {
      console.log('form alter trigger fired');
      var classField = characterCreationPrompt.newField('text');
      classField.name = 'class';
      classField.formatPrompt('Class:');
      characterCreationPrompt.addField(classField);
    });
  }
}

module.exports = new Module();
