var warned = {};
/**
 * Logs a warning message
 * but dont warn a same message twice
 */

export default function warnOnce(message) {
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