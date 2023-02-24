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

function AddressBookO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 30 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M18.357 11.5c0 2.554-2.089 4.625-4.643 4.625S9.071 14.054 9.071 11.5c0-2.571 2.089-4.643 4.643-4.643s4.643 2.071 4.643 4.643zm-.857 3.929c3.411 0 3.946 4.054 3.946 6.679 0 1.5-.946 3.036-2.589 3.036H8.571c-1.643 0-2.589-1.536-2.589-3.036 0-2.518.536-6.679 3.857-6.679h.089c1.179.696 2.375 1.554 3.786 1.554s2.607-.857 3.786-1.554zm12.214-4.572a.587.587 0 01-.571.571h-1.714v2.286h1.714c.304 0 .571.268.571.571v3.429a.587.587 0 01-.571.571h-1.714v2.286h1.714c.304 0 .571.268.571.571v3.429a.587.587 0 01-.571.571h-1.714v4a2.866 2.866 0 01-2.857 2.857H2.858a2.866 2.866 0 01-2.857-2.857V2.856A2.866 2.866 0 012.858-.001h21.714a2.866 2.866 0 012.857 2.857v4h1.714c.304 0 .571.268.571.571v3.429zm-4.571 18.286V2.857a.587.587 0 00-.571-.571H2.858a.587.587 0 00-.571.571v26.286c0 .304.268.571.571.571h21.714a.587.587 0 00.571-.571z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(AddressBookO);
var _default = ForwardRef;
exports["default"] = _default;