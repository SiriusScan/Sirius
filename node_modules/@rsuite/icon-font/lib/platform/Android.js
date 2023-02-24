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

function Android(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M10.271.302a.565.565 0 01.749-.245.542.542 0 01.249.733l-.557 1.092a4.898 4.898 0 012.256 3.572L13 7H3V5.454a4.898 4.898 0 012.258-3.572L4.7.79a.542.542 0 01.25-.733.566.566 0 01.748.245l.559 1.095.144-.055a5.104 5.104 0 013.167 0l.144.055zm-.289 3.699a.827.827 0 00-.839.818c0 .451.374.817.837.817a.827.827 0 00.837-.817.827.827 0 00-.835-.818zm-3.997 0a.828.828 0 00-.835.818c0 .451.376.817.837.817s.836-.366.836-.817a.827.827 0 00-.838-.818zM13 15.992V8H3v8h9.999zM1 8a1 1 0 011 1v5a1 1 0 01-2 0V9a1 1 0 011-1zM15 8a1 1 0 011 1v5a1 1 0 01-2 0V9a1 1 0 011-1z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Android);
var _default = ForwardRef;
exports["default"] = _default;