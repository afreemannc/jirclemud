// @file Tic queue handlers
var Events = require('events');

function TicQueues() {
  this.queues = {};

  this.addQueue = function(name, interval) {
    Tics.queues[name] = {
      name: name,
      interval: interval,
      event: new Events.EventEmitter(),
      started: false
    };
    return this.queues[name];
  }

  this.startQueues = function() {
    var queueKeys = Object.keys(Tics.queues);
    console.log(queueKeys);
    for (i = 0; i < queueKeys.length; ++i) {
      var queue = this.queues[queueKeys[i]];
      if (queue.started === true) {
        continue;
      }
      console.log('interval creation:' +  queue.name);
      var interval = setInterval(function(queue) {
        console.log('tic:' + queue.name);
        queue.event.emit(queue.name);
      }, queue.interval * 100, queue);
      Tics.queues[queue.name].started = true;
    }
  }

}

module.exports = new TicQueues();
