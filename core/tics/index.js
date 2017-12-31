// @file Tic queue handlers
var Events = require('events');

function TicQueues() {};

// Queue storage.
TicQueues.prototype.queues = [];

/**
 * Create a new tic queue and add it to the existing queue list.
 *
 * @param name
 *   Queue name. This property is used to find this queue in the queue list and should be unique.
 *
 * @param interval
 *   Number of milliseconds to wait between tics in this queue.
 */
TicQueues.prototype.addQueue = function(name, interval) {
  var newQueue = {
    name: name,
    interval: interval,
    event: new Events.EventEmitter(),
    started: false
  }
  Tics.queues.push(newQueue);
  return newQueue;
}

/**
 * Start any unstarted queues.
 */
TicQueues.prototype.startQueues = function() {
  for (var i = 0; i < Tics.queues.length; ++i) {
    var queue = Tics.queues[i];
    if (queue.started === true) {
      continue;
    }
    var interval = setInterval(function(queue) {
      queue.event.emit(queue.name);
    }, queue.interval * 1000, queue);
    Tics.queues[i].started = true;
  }
}

/**
 * Start individual queue.
 */
TicQueues.prototype.startQueue = function(queueName) {
  for (var i = 0; i < Tics.queues.length; ++i) {
    if (Tics.queues[i].name == queueName) {
      var queue = Tics.queues[i];
      var interval = setInterval(function(queue) {
        queue.event.emit(queue.name);
      }, queue.interval * 1000, queue);
      Tics.queues[i].started = true;
      break;
    }
  }
}

/**
 * Stop a specific queue.
 */
TicQueues.prototype.stopQueue = function(queueName) {
  for (var i = 0; i < Tics.queues.length; ++i) {
    if (Tics.queues[i].name == queueName) {
      Tics.queues.splice(i, 1);
      break;
    }
  }
}

/**
 * Look up a queue by name.
 *
 * @param queueName
 *   Name of the queue to search for.
 *
 * @return
 *   Returns the queue object or false if not found.
 */
TicQueues.prototype.findQueue = function(queueName) {
  for (var i = 0; i < Tics.queues.length; ++i) {
    if (Tics.queues[i].name === queueName) {
      return Tics.queues[i];
    }
  }
  return false;
}

module.exports = new TicQueues();
