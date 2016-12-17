var normalizedPath = require("path").join(__dirname, "core");

require("fs").readdirSync(normalizedPath).forEach(function(file) {
  command = require("./core/" + file);
  console.log('command:');
  console.log(command);
});
