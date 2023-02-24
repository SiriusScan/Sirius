"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var React = _interopRequireWildcard(require("react"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function MarsDouble(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 34 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.429 7.429c0-.321.25-.571.571-.571h5.143c.625 0 1.143.518 1.143 1.143v5.143c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571v-2.393l-4.536 4.554c1.75 2.196 2.625 5.107 2.089 8.232-.75 4.339-4.286 7.75-8.643 8.357a10.283 10.283 0 01-11.179-6.786C4.089 24.822-.357 19.965.018 14.162c.321-4.893 4.196-8.964 9.071-9.518 2.875-.339 5.554.554 7.607 2.179l4.554-4.536h-2.393a.564.564 0 01-.571-.571V.573c0-.321.25-.571.571-.571H24c.625 0 1.143.518 1.143 1.143v5.143c0 .321-.25.571-.571.571h-1.143a.564.564 0 01-.571-.571V3.895l-4.536 4.554a10.362 10.362 0 011.661 3.018c2.214.107 4.232.929 5.857 2.214l4.554-4.536h-2.393a.564.564 0 01-.571-.571V7.431zm-9.143 7.428c0-.357-.036-.696-.071-1.036-3.839.589-6.786 3.893-6.786 7.893 0 .357.036.696.071 1.036 3.839-.589 6.786-3.893 6.786-7.893zm-16 0c0 4.036 3.018 7.375 6.911 7.911a10.06 10.06 0 01-.054-1.054c0-5.036 3.643-9.232 8.446-10.107a7.998 7.998 0 00-7.304-4.75c-4.411 0-8 3.589-8 8zm17.143 14.857c4.411 0 8-3.589 8-8 0-4.036-3.018-7.375-6.911-7.911.036.339.054.696.054 1.054 0 5.036-3.643 9.232-8.446 10.107a7.998 7.998 0 007.304 4.75z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(MarsDouble);
var _default = ForwardRef;
exports["default"] = _default;