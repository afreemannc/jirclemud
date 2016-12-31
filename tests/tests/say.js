// Test start prompt

function Test() {
  this.tests = [];
  var test1 = {
    name: 'Start screen transition to login',
    send: 'l',
    expect: 'Character Name:',
    skip: ']og'
  }
  this.tests.push(test1);

  var test2 = {
    name: 'Login screen transition to password',
    send:'test',
    expect: 'Password:',
    skip: ']og'
  }
  this.tests.push(test2);

  var test3 = {
    name: 'Login screen successful authentication',
    send:'test',
    expect: 'Welcome',
    skip: ']og',
  }
  this.tests.push(test3);

  var test4 = {
    name: 'Say: personal echo works',
    send: 'say hi',
    expect: "You say 'hi'",
    skip: '',
  }

  // TODO: figure out how to log in a 2nd player for room message testing.

}

module.exports = new Test();
