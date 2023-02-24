"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = reactToString;

var _react = _interopRequireDefault(require("react"));

function reactToString(element) {
  var nodes = [];

  var recursion = function recursion(elmt) {
    _react.default.Children.forEach(elmt.props.children, function (child) {
      if ( /*#__PURE__*/_react.default.isValidElement(child)) {
        recursion(child);
      } else if (typeof child === 'string') {
        nodes.push(child);
      }
    });
  };

  recursion(element);
  return nodes;
}