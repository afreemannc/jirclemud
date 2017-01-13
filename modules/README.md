# Modules


## Enabling a module


## Disabling a module


## Module structure
function Module() {
  this.name = 'Talker';
  this.description = 'Add talker items to your world setting.'
  this.features = ['commands'];

  this.install = function() {
    // Do stuff once when this module is enabled.
  };

  this.load = function() {
    // Do stuff whenever this module is loaded.
  }

  this.disable = function() {
    // Clean up as needed when this module is disabled.
  }
}
module.exports = new Module();


- Name: The name of the module. This shows up in the admin console and is used to namespace your module code in the Modules global object.
- Description: A brief description of what this module does. This shows up in the admin console.
- Features: an array of features this module implements.
- Install: false if the module does not need to do anything when it is first enabled, otherwise a function that contains whatever code needs
           to be executed when enabling this module.
- Load: false if the module does not need to do anything when the world is loading, otherwise a function.
- Disable: similar to load and install, run once when the module is disabled.
