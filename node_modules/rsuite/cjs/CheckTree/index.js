"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireWildcard(require("react"));

var _CheckTreePicker = _interopRequireDefault(require("../CheckTreePicker"));

var _TreeContext = _interopRequireDefault(require("../Tree/TreeContext"));

var CheckTree = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var contextValue = (0, _react.useMemo)(function () {
    return {
      inline: true
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement(_TreeContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_CheckTreePicker.default, (0, _extends2.default)({
    ref: ref
  }, props)));
});

CheckTree.displayName = 'CheckTree';
var _default = CheckTree;
exports.default = _default;