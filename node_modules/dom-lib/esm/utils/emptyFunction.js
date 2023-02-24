var _this = this;

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

export default emptyFunction;