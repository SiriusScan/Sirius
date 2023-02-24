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

function EnvelopeOpenO(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M26.321 16.304l.696.911a.565.565 0 01-.089.786c-1.786 1.393-5.893 4.554-6.071 4.696-1.268 1.036-2.982 2.464-4.839 2.446h-.036c-1.857 0-3.571-1.411-4.839-2.446-.196-.161-4.161-3.214-5.911-4.571a.55.55 0 01-.107-.786l.661-.929a.562.562 0 01.821-.107c1.214.946 2.929 2.268 5.464 4.214.893.679 2.661 2.339 3.911 2.339h.036c1.25 0 3.018-1.661 3.911-2.339 2.625-2.018 4.375-3.357 5.589-4.321a.572.572 0 01.804.107zm3.393 12.839V12.572c-1.786-1.661-1.518-1.518-9.786-7.911-.893-.696-2.661-2.375-3.911-2.375h-.036c-1.25 0-3.018 1.679-3.911 2.375-8.268 6.393-8 6.25-9.786 7.911v16.571c0 .304.268.571.571.571h26.286a.587.587 0 00.571-.571zM32 12.571v16.571a2.866 2.866 0 01-2.857 2.857H2.857A2.866 2.866 0 010 29.142V12.571c0-.643.268-1.25.732-1.679 3.661-3.393 7.875-6.339 10.411-8.429 1.25-1.036 2.982-2.464 4.839-2.464h.036c1.857 0 3.589 1.429 4.839 2.464 2.357 1.946 6.839 5.107 10.411 8.429.464.429.732 1.036.732 1.679z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(EnvelopeOpenO);
var _default = ForwardRef;
exports["default"] = _default;