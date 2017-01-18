// user stuff
var dice = require('./dice');
var crypto = require('crypto');
var Events = require('events');
// Session mode handler for login

var characters = function(){
  this.event = new Events.EventEmitter();
  /**
   * Login screen prompt.
   */
  this.login = function(session) {

    var loginPrompt = Prompt.new(session, this.loginAuthenticate);
    loginPrompt.quittable = false;

    var loginField = loginPrompt.newField('text');
    loginField.name = 'username';
    loginField.formatPrompt('Character Name:');
    loginPrompt.addField(loginField);

    var passwordField = loginPrompt.newField('text');
    passwordField.name = 'password';
    passwordField.formatPrompt('Password:');
    loginPrompt.addField(passwordField);

    loginPrompt.start();
  }

  /**
   * Login prompt completion handler.
   */
  this.loginAuthenticate = function(session, fieldValues) {
    var Character = Models.Character;
    var userName = fieldValues.username;
    var password = fieldValues.password;
    // Salt is required to generate the user's password hash.
    Character.findOne({
      attributes:['salt'],
      where: {
        name:userName
      }
    }).then(function(result) {
      if (result) {
        var salt = result.get('salt');
        var passwordHash = Characters.passHash(salt, password);
       // Attempt authentication
        Character.findOne({
          where: {
            name:userName,
            pass:passwordHash
          }
        }).then(function(results) {
          if (results) {
            // Authentication successful, load character details.
            var character = results.dataValues;
            session.character = character;
            Characters.loadCharacterDetails(session);
            Characters.event.emit('characterLoad', session);
          }
          else {
            // Authentication failed.
            session.prompt.displayCompletionError(session, 'Login incorrect.\n');
          }
        });
      }
      else {
        // Salt not found, this suggests the character name doesn't exist.
        session.prompt.displayCompletionError(session, 'Login incorrect.\n');
      }
    });
  }

  /**
   * Load additional character details like stats, spell effects, and item inventory.
   */
  this.loadCharacterDetails = function(session) {
    var character = session.character;
    // Unpack stored properties
    session.character.stats = JSON.parse(character.stats);
    session.character.effects = JSON.parse(character.effects);
    session.character.equipment = JSON.parse(character.equipment);
    session.character.perms = JSON.parse(character.perms);
    session.character.inventory = JSON.parse(character.inventory);

    var values = {
      containerType: 'player_inventory',
      parentId: character.id
    }

    // Raw socket write is used here since the command prompt will be displayed after "look" runs.
    session.socket.write('Welcome back ' + character.name + '\n');
    session.inputContext = 'command';
    Commands.triggers.look(session, '');
  }

  /**
   * Create an empty data structure to hold character equipment.
   */
  this.initializeEqSlots = function() {
    var slotKeys = Object.keys(Config.equipmentSlots);
    var equipment = {};
    var slot = '';

    for (var i = 0; i < slotKeys.length; ++i) {
      slot = Config.equipmentSlots[slotKeys[i]];
      equipment[slot] = false;
    }
    console.log(equipment);
    return equipment;
  }

  /**
   * Character creation prompt.
   */
  this.createCharacter = function(session) {
    var createCharacterPrompt = Prompt.new(session, this.saveNewCharacter);
    createCharacterPrompt.quittable = false;

    var saltField = createCharacterPrompt.newField('value');
    saltField.name = 'salt';
    saltField.value = crypto.randomBytes(Math.ceil(4)).toString('hex').slice(0, 8);
    createCharacterPrompt.addField(saltField);

    var characterNameField = createCharacterPrompt.newField('text');
    characterNameField.name = 'charactername';
    characterNameField.validate = this.validateCharacterName;
    characterNameField.formatPrompt('Character Name:\n');
    createCharacterPrompt.addField(characterNameField);

    var passwordField = createCharacterPrompt.newField('text');
    passwordField.name = 'password';
    passwordField.formatPrompt('Password:\n');
    createCharacterPrompt.addField(passwordField);

    var classField = createCharacterPrompt.newField('select');
    classField.name = 'characterclass';
    classField.options = Classes.selectionOptions();
    classField.formatPrompt('Please select a character class:');
    createCharacterPrompt.addField(classField);

    createCharacterPrompt.start();;
  }

  /**
   * Password hashing routine.
   *
   * @param salt
   *   Password salt
   *
   * @param password
   *   Password to hash
   *
   * @return
   *   Returns a hash of the combination of salt and password.
   */
  this.passHash = function(salt, password) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('hex');
  }

  this.saveNewCharacter = function(session, fieldValues) {
    var Character = Models.Character;
    var hashedPassword = Characters.passHash(fieldValues.salt, fieldValues.password);
    var values = {
      id: '',
      name: fieldValues.charactername,
      pass: hashedPassword,
      salt: fieldValues.salt,
      last_login: 0,
      status: 1,
      current_room: Config.startRoomId,
      stats: Characters.startProperties(fieldValues.characterclass),
      effects: Characters.startEffects(),
      equipment: JSON.stringify(Characters.initializeEqSlots()),
      inventory: JSON.stringify([])
    };

    Character.create(values).then(function(instance) {
      session.character = instance.dataValues;
      session.socket.write('Welcome ' + values.name + '\n');
      session.inputContext = 'command';
      Commands.triggers.look(session, '');
      var Container = Models.Container;
      var values = {
        cid: '',
        container_type: 'character',
        parent_id: instance.get('id'),
        max_size: 20,
        max_weight: 200 // TODO: alter based on str
      }
      Container.create(values).then(function(instance) {

      });
    });
  }

  // Save character record.
  // TODO: convert to Promise
  this.saveCharacter = function(session, values) {
    var Character = Models.Character;

    Character.upsert(values).then(function (created) {
      if (created) {
        console.log('new character record created');
      }
      else {
        console.log('character record updated');
      }
    });
  }

  /**
   * Build starting character properties based on initial class selection during character creation.
   */
  this.startProperties = function(characterClass) {
    // TODO: implement some kind of stat system. Probably standard D20 style to start.
    var characterClass = Classes.classFromSelection(characterClass);
    // TODO: add con bonus once stats are implemented.
    var startingHP = dice.roll(characterClass.hitDice);
    var startingMana = 10; //TODO: implement some mana thing once casters are in.
    var properties = {
      class: characterClass.name,
      class_level: 1,
      maxhp: startingHP,
      currenthp: startingHP,
      maxmana: startingMana,
      currentmana: startingMana,
      xp: 1,
      current_room: Config.startRoom,
      flags: []
    }
    // TODO: add stats based on stat system
    // TODO: add currency placeholders based on currency system
    return JSON.stringify(properties);
  }

  /**
   * If a character should begin the game with starting spell effects
   * this is how they are applied.
   */
  this.startEffects = function() {
    // Currently no starting affects, will add
    // sustain and others as needed later.
    return JSON.stringify({sustain:500});
  }

  /**
   * Test if a given character name is already in use.
   *
   * @param session
   *   Session object
   *
   * @param name
   *   String containing the character name to look for.
   *
   * @return
   *   Returns boolean: false if character name is already in use, otherwise true.
   */
  this.validateCharacterName = function(session, name) {
    var Character = Models.Character;
    if (name.length === 0) {
      session.prompt('Character Name:\n', 'name');
      return false;
    }

    Character.findOne({
     attributes:['id'],
      where: {
        name:name
      }
    }).then(function (character) {
      // Since we can't just return true or false from the parent function
      // there's some manual form handling that has to take place.
      console.log('response:' + character);
      if (character !== null) {
        var message = name + ' is already in use. Please select a different character name.\n';
        session.socket.write(message);
        this.promptUser(session.prompt.currentField);
      }
      else {
        session.prompt.currentField.cacheInput(name);
        var fieldIndex = session.prompt.getFieldIndex(session.prompt.currentField.name);
        session.prompt.currentField = session.prompt.fields[fieldIndex + 1];
        session.prompt.promptUser();
      }
    });
    return null;
  }

  /**
   * Search current active characters by character name.
   *
   * @param name
   *   Character name (or name fragment) to search for.
   *
   * @return
   *  If found returns the numeric character id of the character found.
   *  Otherwise returns false;
   */
  this.searchActiveCharactersByName = function(name) {
    for (var i = 0; i < Sessions.length; ++i) {
      var session = Sessions[i];
      if (session.character.name.startsWith(name)) {
        return session;
      }
    }
    return false;
  }

}

module.exports = new characters();
