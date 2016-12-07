var dice = function() {};

dice.prototype.roll = function(input) {
  var parts = input.split('d');
  var count = parts[0];
  var die = parts[1];
  var roll = 0;
  var total = 0;

  while(count > 0) {
    roll = Math.floor(Math.random() * die) + 1;
    console.log('roll:' + roll);
    total += roll;
    count--;
  }
  return total;
}

module.exports = new dice();
