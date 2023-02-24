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

function Car(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 37 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M8.571 19.429c0-1.571-1.286-2.857-2.857-2.857s-2.857 1.286-2.857 2.857 1.286 2.857 2.857 2.857S8.571 21 8.571 19.429zm.643-5.715h18.143l-1.589-6.375c-.054-.196-.411-.482-.625-.482H11.429c-.214 0-.571.286-.625.482zm24.5 5.715c0-1.571-1.286-2.857-2.857-2.857S28 17.858 28 19.429s1.286 2.857 2.857 2.857 2.857-1.286 2.857-2.857zm2.857-1.715v6.857c0 .321-.25.571-.571.571h-1.714v2.286a3.43 3.43 0 01-6.858 0v-2.286H9.142v2.286a3.43 3.43 0 01-6.858 0v-2.286H.57a.564.564 0 01-.571-.571v-6.857c0-2.214 1.786-4 4-4h.5l1.875-7.482c.554-2.25 2.732-3.946 5.054-3.946h13.714c2.321 0 4.5 1.696 5.054 3.946l1.875 7.482h.5c2.214 0 4 1.786 4 4z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Car);
var _default = ForwardRef;
exports["default"] = _default;