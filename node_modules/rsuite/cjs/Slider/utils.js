"use strict";

exports.__esModule = true;
exports.checkValue = checkValue;
exports.precisionMath = void 0;

var precisionMath = function precisionMath(value) {
  return parseFloat(value.toFixed(10));
};

exports.precisionMath = precisionMath;

function checkValue(value, min, max) {
  if (typeof value === 'undefined') {
    return value;
  }

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}