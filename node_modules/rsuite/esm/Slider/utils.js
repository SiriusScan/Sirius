export var precisionMath = function precisionMath(value) {
  return parseFloat(value.toFixed(10));
};

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

export { checkValue };