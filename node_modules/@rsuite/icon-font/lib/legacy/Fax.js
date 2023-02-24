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

function Fax(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M5.143 6.857A2.866 2.866 0 018 9.714v19.429A2.866 2.866 0 015.143 32H2.857A2.866 2.866 0 010 29.143V9.714a2.866 2.866 0 012.857-2.857h2.286zm24.571 2.911A4.579 4.579 0 0132 13.714v13.714a4.58 4.58 0 01-4.571 4.571H12a2.866 2.866 0 01-2.857-2.857V1.713c0-.946.768-1.714 1.714-1.714h12c.946 0 2.268.554 2.929 1.214L28.5 3.927c.661.661 1.214 1.982 1.214 2.929v2.911zM16.571 27.429v-2.286a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571H16c.321 0 .571-.25.571-.571zm0-4.572v-2.286A.564.564 0 0016 20h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571H16c.321 0 .571-.25.571-.571zm0-4.571V16a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571H16c.321 0 .571-.25.571-.571zm4.572 9.143v-2.286a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571zm0-4.572v-2.286a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571zm0-4.571V16a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571zm4.571 9.143v-2.286a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571zm0-4.572v-2.286a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571zm0-4.571V16a.564.564 0 00-.571-.571h-2.286a.564.564 0 00-.571.571v2.286c0 .321.25.571.571.571h2.286c.321 0 .571-.25.571-.571zm1.715-6.857V6.858h-2.857a1.715 1.715 0 01-1.714-1.714V2.287H11.429v9.143h16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Fax);
var _default = ForwardRef;
exports["default"] = _default;