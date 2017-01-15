var Command = function() {
  this.trigger = 'attributes';
  this.helpText = `
  Display information on your character's current attribute scores.

  %yellow%Usage:%yellow%
         attributes

  %yellow%Usage:%yellow%
         > attributes
         >
         > %bold%Derp the Halfling rat-catcher (Male Halfling)
         > You are a member of the Guild of Rat Catchers.
         > You are 4 ft. 11 in. tall and weigh 86 lbs.
         > You are carrying 2 items, and wearing 16 items.
         > Your total encumbrance is 44 lbs.
         >
         > Strength: 12   Intelligence: 8    Wisdom: 13
         > Dexterity: 18   Constitution: 17    Charisma: 5
         >
         > %cyan%MELEE ::%cyan%
         > Hit: +2   Damage: +4
         > AC: 14   THAC0: 2   APR: 1 per round%bold%

         > You are 37 years, 15 months, and 32 days old.
         > You are half drunk, stuffed, and not thirsty.
         > Your alignment is 102 (Neutral Good).
  `;
  this.callback = function (session, input) {
    console.log(session.character);
    var template = `

%character.name% the %character.race% %character.class% (%character.gender% %character.race%))

You are %character.height% and weigh %character.weight%.
You are carrying %character.inventorycount% items, and wearing %character.equipmentcount% items.
Your total encumbrance is %character.encumbrance% lbs.

<stat row 1>
<stat row 2>

%cyan%MELEE:%cyan%
Hit: %character.stats.hit%    Damage: %character.stats.dam%
AC: %character.stats.ac%    APR: %character.stats.apr%

<age row>
<sustenance row>
<alignment row>

`;
    // TODO: make Tokens.replace truly generic.
    session.write(Tokens.replace(template, {character: session.character}));
  }

}

module.exports = new Command();
