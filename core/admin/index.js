// @file Administration console features.

var Admin = function() {};


Admin.prototype.inputHandler  = function(session, inputRaw) {
    var input = inputRaw.replace(/(\r\n|\n|\r)/gm,"");
}

module.exports = new Admin;
