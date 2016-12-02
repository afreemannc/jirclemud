module.exports.quit = function(socket) {
   socket.end('Goodbye!\n');
}

module.exports.look = function(socket, input) {
    // Room look
    if (input.length === 0) {
      socket.write('room desc');
    }
    else {
      // does thing exist?
      // if so retrieve description and print
      socket.write('item desc');
    }
}

module.exports.get = function(socket, input) {
    if (input.length === 0) {
      socket.write('Get what??\n');
    }
    else {
    // does thing exist?
    // can it be gotten?
       // CARRY flag?
       // Weight vs character lift?
       // Room in carry inventory?
    // if so transfer item from current location to carry inventory
    socket.write('You pick up ' + input);
    }
}
