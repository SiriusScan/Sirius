import ReactDOM from 'react-dom';
var majorVersion = parseInt(ReactDOM.version);
/**
 * Force React to flush any updates inside the provided callback synchronously.
 * This ensures that the DOM is updated immediately.
 */

var flushSync = function flushSync(callback) {
  if (majorVersion >= 18) {
    var _ReactDOM$flushSync;

    (_ReactDOM$flushSync = ReactDOM.flushSync) === null || _ReactDOM$flushSync === void 0 ? void 0 : _ReactDOM$flushSync.call(ReactDOM, callback);
    return;
  }

  callback();
};

export default flushSync;