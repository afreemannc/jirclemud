var net = require('net');
global.colors = require('colors/safe');

global.tests = [];

// load tests
var normalizedPath = require("path").join(__dirname, "tests");
var testSuites = require("fs").readdirSync(normalizedPath)
for(i = 0; i < testSuites.length; ++i) {
  suite = require("./tests/" + testSuites[i]);
  for (i = 0; i < suite.tests.length; ++i) {
    index = global.tests.length;
    suite.tests[i].index = index;
    global.tests.push(suite.tests[i]);
  }
}
global.index = 0;
global.socket = net.connect(8765, '127.0.0.1');

runTest(global.tests[0]);

function sendOutput(test) {
  return new Promise((resolve, reject) => {
    global.socket.write(test.send);
    global.socket.on('data', function(data) {
      if (data.includes(test.skip) === false) {
        test.response = data.toString().replace(/(\r\n|\n|\r)/gm,"");
        return resolve(test);
      }
    });
  });
}

function runTest(test) {
  sendOutput(test).then((test, response) => {
    if (test.response === test.expect) {
      console.log(test.name + ' [' + global.colors.green('PASSED') + ']');
    }
    else {
      console.log(test.name + ' [' + global.colors.red('FAILED') + ']');
      console.log(global.colors.yellow('-- expected:' + test.expect));
      console.log(global.colors.yellow('-- response:' + test.response));
    }
    if (test.index < global.tests.length - 1) {
      runTest(global.tests[test.index + 1]);
    }
    else {
      global.socket.end();
    }
  });
}
