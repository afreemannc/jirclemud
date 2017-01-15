/**
 * @file Variable handling system
 *
 * The variables global and it's associated db table provide a convenient storage mechanism
 * in instances where defining a separate database table would be overkill.
 */
function Variables() {
  this.variables = {};

  this.get = function(variableName) {
    if (typeof Variables.variables[variableName] === false) {
      return false;
    }
    else {
      return Variables.variables[variableName];
    }
  }

  this.set = function(variableName, value) {
    Variables.variables[variableName] = value;

    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }

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

  this.loadVariables = function() {
    var Variable = Models.Variable;
    Variable.findAll().then(function(instances) {
      instances.forEach(function(instance) {
        var variable = instance.dataValues;
        Variables.variables[variable.name] = JSON.parse(variable.value);
      });
    });
  }
}

module.exports = new Variables();
