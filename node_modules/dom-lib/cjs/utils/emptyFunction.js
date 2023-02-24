"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _this = void 0;

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

function emptyFunction() {}

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);

emptyFunction.thatReturnsThis = function () {
  return _this;
};

emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

var _default = emptyFunction;
exports["default"] = _default;
module.exports = exports.default;