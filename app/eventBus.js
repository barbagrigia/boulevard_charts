'use strict';

var messageQueue = [],
    port;

function emit(message) {
  if (port) {
    port.postMessage(message);
  } else {
    messageQueue.push(message);
  }
}

window.addEventListener("message", receiveMessage, false);

function receiveMessage(e) {
  if (e.data === 'port:init') {
    port = e.ports[0];

    while (port && messageQueue.length) {
      sendMessage(messageQueue.pop());
    }
  }
}

module.exports = {
  emit: emit
};
