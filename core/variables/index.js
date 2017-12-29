/**
 * @file Variable handling system
 *
 * The variables global and it's associated db table provide a convenient storage mechanism
 * in instances where defining a separate database table would be overkill.
 */
function variables() {
  this.data = {};
};

variables.prototype.get = function(variableName, defaultValue) {
  if (typeof Variables.data[variableName] === 'undefined') {
    if (defaultValue === 'undefined') {
      return false;
    }
    else {
      Variables.set(variableName, defaultValue);
      return defaultValue;
    }
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
variables.prototype.set = function(variableName, setValue) {
  Variables.data[variableName] = setValue;

  var Variable = Models.Variable;
  var values = {
    where: {name: variableName},
    defaults: {value: setValue}
  }
  Variable.findOrCreate(values).then(function(instance, created) {
    if (created === false) {
      Variable.update({value:setValue}, {where:{name:variableName}});
    }
  });
}

/**
 * Permanently remove a variable setting.
 *
 * @param variableName
 *   Name key for this variable.
 *
 */
variables.prototype.del = function(variableName) {
  if (typeof Variable.data[variableName] !== 'undefined') {
    Variable.data.splice(variableName, 1);
    Variable.destroy({where: {name: variableName}});
  }
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
