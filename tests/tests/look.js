// Test start prompt

function TestLogin() {
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
    name: 'Room look works',
    send: 'look',
    expect: '',
    skip: '',
  }
  this.tests.push(test4);

  var test5 = {
    name: 'Item look works',
    send: 'look <item>',
    expect: '',
    skip: '',
  }

  var test6 = {
    name: 'Exit look works',
    send: 'look e',
    expect: '',
    skip: '',
  }

}

module.exports = new TestLogin();
