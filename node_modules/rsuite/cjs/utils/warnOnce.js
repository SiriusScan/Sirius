"use strict";

exports.__esModule = true;
exports.default = warnOnce;
var warned = {};
/**
 * Logs a warning message
 * but dont warn a same message twice
 */

function warnOnce(message) {
  if (!warned[message]) {
    console.warn(message);
    warned[message] = true;
  }
}

warnOnce._resetWarned = function () {
  for (var _message in warned) {
    delete warned[_message];
  }
};