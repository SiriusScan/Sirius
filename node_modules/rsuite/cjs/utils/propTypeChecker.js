"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.tupleType = tupleType;
exports.refType = void 0;

var _propTypes = _interopRequireDefault(require("prop-types"));

function tupleType() {
  for (var _len = arguments.length, typeCheckers = new Array(_len), _key = 0; _key < _len; _key++) {
    typeCheckers[_key] = arguments[_key];
  }

  return _propTypes.default.arrayOf(function (value, index) {
    var _typeCheckers$index;

    for (var _len2 = arguments.length, rest = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      rest[_key2 - 2] = arguments[_key2];
    }

    return (_typeCheckers$index = typeCheckers[index]).call.apply(_typeCheckers$index, [_propTypes.default, value, index].concat(rest));
  });
}

var refType = _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.any]);

exports.refType = refType;