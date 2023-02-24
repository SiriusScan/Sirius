"use strict";

exports.__esModule = true;
exports.default = void 0;

var _react = require("react");

function useRegisterModel(name, pushFieldRule, removeFieldRule, rule) {
  var refRule = (0, _react.useRef)(rule);
  refRule.current = rule;
  (0, _react.useEffect)(function () {
    pushFieldRule(name, refRule);
    return function () {
      removeFieldRule(name);
    };
  }, [name, pushFieldRule, removeFieldRule]);
}

var _default = useRegisterModel;
exports.default = _default;