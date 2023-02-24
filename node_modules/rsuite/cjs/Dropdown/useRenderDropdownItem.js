"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.useRenderDropdownItem = useRenderDropdownItem;

var _react = _interopRequireWildcard(require("react"));

function useRenderDropdownItem(Component) {
  return (0, _react.useCallback)(function (props, OverrideComponent) {
    if (Component === 'li') {
      if (OverrideComponent) {
        return /*#__PURE__*/_react.default.createElement("li", {
          role: "none presentation"
        }, /*#__PURE__*/_react.default.createElement(OverrideComponent, props));
      }

      return /*#__PURE__*/_react.default.createElement(Component, props);
    }

    return /*#__PURE__*/_react.default.createElement("li", {
      role: "none presentation"
    }, /*#__PURE__*/_react.default.createElement(Component, props));
  }, [Component]);
}