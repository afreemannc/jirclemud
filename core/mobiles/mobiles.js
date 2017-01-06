
function Mobiles() {
  // load

  // create
  this.create = function(session) {
    var createMobilePrompt = Prompt.new(session, this.saveNewMobile);

    // Name
    var mobileNameField = createMobilePrompt.newField('text');
    mobileNameField.name = 'name',
    mobileNameField.formatPrompt('What should this mobile be named? (Name displays in room.)'),
    createMobilePrompt.addField(mobileNameField);

    // Description
    var mobileDescField = createMobilePrompt.newField('multitext');
    mobileDescField.name = 'description',
    mobileDescField.formatPrompt('Describe this mobile. (Description displayed by "look")'),
    createMobilePrompt.addField(mobileDescField);

    // stats
    // HP
    var mobileHPField = createMobilePrompt.newField('int');

    // MANA
    var mobileMAField = createMobilePrompt.newField('int');

    // LEVEL
     var mobileLVLField = createMobilePrompt.newField('int');

    // fieldgroup
      // equipment
        // worn or inventory?

    // flags
      // NONE
      // CASTER
        // fieldgroup
          // spell
          // % cast
      // SKILLED
        // fieldgroup
           // skill
           // % use
      // AGGRO
      // ZONEHUNTER
      // WORLDHUNTER
  }

  // edit

    // name

    // description

    // stats

    // equipment

    // FLAGS

  // delete

  // save
}

module.exports = new Mobiles();
