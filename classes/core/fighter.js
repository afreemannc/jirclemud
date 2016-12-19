var CharacterClass = function() {
  this.name = 'Fighter';
  this.selectOption = 'f';
  this.description = 'Dumb, strong, heavily armed. What more do you want?';
  this.hitDice = '1d10';
  this.primaryStat = 'strength';
}

module.exports = new CharacterClass();
