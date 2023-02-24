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

function Anchor(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.143 4.571c0-.625-.518-1.143-1.143-1.143s-1.143.518-1.143 1.143.518 1.143 1.143 1.143 1.143-.518 1.143-1.143zM32 21.143v6.286a.586.586 0 01-.357.536.888.888 0 01-.214.036.63.63 0 01-.411-.161l-1.661-1.661c-2.804 3.375-7.839 5.536-13.357 5.536S5.446 29.554 2.643 26.179L.982 27.84a.597.597 0 01-.411.161.888.888 0 01-.214-.036.585.585 0 01-.357-.536v-6.286c0-.321.25-.571.571-.571h6.286c.232 0 .446.143.536.357s.036.446-.125.625L5.482 23.34c1.607 2.161 4.696 3.732 8.232 4.214V16h-3.429a1.151 1.151 0 01-1.143-1.143v-2.286c0-.625.518-1.143 1.143-1.143h3.429V8.517a4.557 4.557 0 01-2.286-3.946C11.428 2.053 13.482 0 15.999 0s4.571 2.054 4.571 4.571a4.555 4.555 0 01-2.286 3.946v2.911h3.429c.625 0 1.143.518 1.143 1.143v2.286c0 .625-.518 1.143-1.143 1.143h-3.429v11.554c3.536-.482 6.625-2.054 8.232-4.214l-1.786-1.786c-.161-.179-.214-.411-.125-.625s.304-.357.536-.357h6.286c.321 0 .571.25.571.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Anchor);
var _default = ForwardRef;
exports["default"] = _default;