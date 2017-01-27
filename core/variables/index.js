/**
 * @file Variable handling system
 *
 * The variables global and it's associated db table provide a convenient storage mechanism
 * in instances where defining a separate database table would be overkill.
 */
function variables() {
  this.data = {};
};

variables.prototype.get = function(variableName) {
  if (typeof Variables.data[variableName] === false) {
    return false;
  }
  else {
    return Variables.data[variableName];
  }
}

/**
 * Create or update a variable setting.
 *
 * @param variableName
 *   Name key for this variable.
 *
 * @param value
 *   Value to store
 */
variables.prototype.set = function(variableName, value) {
  Variables.data[variableName] = value;

  var Variable = Models.Variable;
  var values = {
    name: 'variableName',
    value: value,
  }
  Variable.findOrCreate(values).then(function(instance, created) {
    if (created === false) {
      Variable.update({where:{name:variableName}});
    }
  });
}

/**
 * Load all saved variables into memory.
 */
variables.prototype.loadVariables = function() {
  var Variable = Models.Variable;
  Variable.findAll().then(function(instances) {
    instances.forEach(function(instance) {
      var variable = instance.dataValues;
      console.log(Variables);
      Variables.data[variable.name] = variable.value;
    });
  });
}

module.exports = new variables();
