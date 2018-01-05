/**
 * @file
 * Rules system API
 */

function rules() {
  this.rules = [];
  this.register = function(rule) {
    if (typeof rule.name !== 'undefined') {
      this.rules[rule.name] = rule;
    }
    else {
      console.log('ERROR: attempting to register malformed rule.');
    }
  }
  this.getRule = function(ruleName) {
    if (typeof this.rules[ruleName] !== 'undefined') {
      return this.rules[ruleName];
    }
    else {
      console.log('Error: attempting to retrieve non-existent rule:' + ruleName);
      return false;
    }
  }
  this.ruleSatisfied = function(ruleName, data) {
    if (typeof this.rules[ruleName] !== 'undefined') {
      var rule = this.rules[ruleName];
      return rule.validate(data);
    }
    else {
      console.log('ERROR: nonexistent rule invoked:' + ruleName);
      return false;
    }
  }
}

module.exports = new rules();
