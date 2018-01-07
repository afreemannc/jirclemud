function Module() {
  this.name = 'Builder';
  this.description = 'In-game world building commands.'
  this.install = false;
  this.features = ['commands', 'prompts'];
}

module.exports = new Module();
