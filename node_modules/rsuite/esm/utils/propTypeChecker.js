import PropTypes from 'prop-types';
export function tupleType() {
  for (var _len = arguments.length, typeCheckers = new Array(_len), _key = 0; _key < _len; _key++) {
    typeCheckers[_key] = arguments[_key];
  }

  return PropTypes.arrayOf(function (value, index) {
    var _typeCheckers$index;

    for (var _len2 = arguments.length, rest = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      rest[_key2 - 2] = arguments[_key2];
    }

    return (_typeCheckers$index = typeCheckers[index]).call.apply(_typeCheckers$index, [PropTypes, value, index].concat(rest));
  });
}
export var refType = PropTypes.oneOfType([PropTypes.func, PropTypes.any]);