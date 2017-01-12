function Module() {
  this.name = 'Talker';
  this.description = 'Add talker items to your world setting.'
  this.install = false;
  this.itemFlags = ['TALKER'];
}

module.exports = new Module();
