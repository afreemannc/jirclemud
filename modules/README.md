# Modules

Modules are optional features that may be enabled to extend your mud's capabilities. They come in two flavors: contributed and custom.

# Contributed modules

These are optional modules that either ship with the mud engine or are maintained as separate publicly available projects.
The idea here being the engine ships with a handful of available plugins and that other developers may publish modules
they have written for others to use freely.

# Custom modules

If you want to further customize your mud's behavior beyond what is possible with the core engine and available contributed
modules the best way to do so is to write one or more custom modules. This not only lets you organize your changes to suite
your needs but ensures that your changes will not be overwritten by future releases of the engine codebase.

## Enabling or disabling a module
Modules may be enabled or disabled via the "arch" command. See "help arch" in-game for more details.

## Module structure
function Module() {
  this.name = 'Talker';
  this.description = 'Add talker items to your world setting.'
  this.features = ['commands'];
  this.dependencies = ['builder'];

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
- Features: (optional) an array of features this module implements.
- Dependencies: (optional) an array of modules that this module needs enabled to function.
- Install: false if the module does not need to do anything when it is first enabled, otherwise a function that contains whatever code needs
           to be executed when enabling this module.
- Load: false if the module does not need to do anything when the world is loading, otherwise a function.
- Disable: similar to load and install, run once when the module is disabled.
