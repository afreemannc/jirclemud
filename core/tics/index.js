// @file Tic queue handlers
var Events = require('events');

function TicQueues() {
  this.queues = [];

  this.addQueue = function(name, interval) {
    var newQueue = {
      name: name,
      interval: interval,
      event: new Events.EventEmitter(),
      started: false
    }
    Tics.queues.push(newQueue);
    return newQueue;
  }

  this.startQueues = function() {
    for (i = 0; i < Tics.queues.length; ++i) {
      var queue = Tics.queues[i];
      if (queue.started === true) {
        continue;
      }
      console.log('interval creation:' +  queue.name);
      var interval = setInterval(function(queue) {
        console.log('tic:' + queue.name);
        queue.event.emit(queue.name);
      }, queue.interval * 1000, queue);
      Tics.queues[i].started = true;
    }
  }

  this.findQueue = function(queueName) {
    for (var i = 0; i < Tics.queues.length; ++i) {
      if (Tics.queues[i].name === queueName) {
        return Tics.queues[i];i
      }
    }
    return false;
  }
}

module.exports = new TicQueues();
