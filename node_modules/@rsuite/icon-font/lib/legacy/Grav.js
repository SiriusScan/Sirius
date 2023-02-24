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

function Grav(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M23.054 8.5c-.571-.643-1.5.446-1 1.036.482.589 2.071.161 1-1.036zm-7.072 4.393a.465.465 0 01-.679 0 .445.445 0 010-.661.465.465 0 01.679 0 .474.474 0 010 .661zm2.947 1.321l-.625.625a.743.743 0 01-1.071 0l-.679-.679a.776.776 0 010-1.071l.625-.625a.776.776 0 011.071 0l.679.696a.755.755 0 010 1.054zm-1.947-2.321a.496.496 0 01-.679 0 .496.496 0 010-.679.465.465 0 01.679 0 .465.465 0 010 .679zm7.197-1.75c-.804 1.518-2.911 2.143-4.196 1.232-1.286-.929-2.179-2.786-.768-4.393 1.393-1.607 2.625-1.107 3.857.054.768.732 1.893 1.607 1.107 3.107zm3.589 8.607c.161-1.036-1.321-1.071-1.643-1.661-.875-1.554-1.786-2.375-3.518-1.964.75-.518 1.518-.393 1.518-.393.018-.411 0-.839-.607-1.607.25-.804.018-1.446.018-1.446a3.682 3.682 0 001.875-2.786 3.668 3.668 0 00-3.214-4.054c-1.429-.161-2.821.5-3.5 1.661-1.5 2.589.089 4.571 1.446 5.25-.929-.089-2.214-.768-2.589-2.214-.429-1.661.179-3.214.571-3.964 0 0-.286-.375-.518-.571 0 0-.893 0-1.589.339.768-.982 1.625-.929 1.625-.929 0-.411-.036-.964-.232-1.393-.357-.732-1.607-.839-2.089.268a.295.295 0 01.071-.125c-.321.768-.071 3.607 1.089 5.625a4.999 4.999 0 00-.839.643c-1.393.625-3.625 3.893-3.625 3.893-1.821.696-5 3.286-4.571 5.143a.845.845 0 00.196.482 3.762 3.762 0 00-.536.536c-.768.893-.339 2.268 1.143 1.571 1.018-.464 1.929-1.304 2.357-1.964 0 0-.375-.321-1.071-.286 1.786-.429 2.232-.607 3-.589.518.25.518-2.214.518-2.214 0-.946-.143-2-.714-2.679.804.786 1.875 2.107 1.804 3.911-.054 1.179-.982 1.482-.982 1.482-.589 1.071-2.786 4.25-1.964 6.839 0 0-.625-.964-.661-1.429-1.125 1.25-3.018 3.375-1.607 4.161 1.714.946 7.036-5.714 8.161-9.179 2.232-1.339 3.571-3.054 4.125-4.196 1.429 2.839 6.179 6.125 6.554 3.839zM32.036 16c0 8.839-7.179 16-16.018 16S0 24.839 0 16 7.179 0 16.018 0s16.018 7.161 16.018 16z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Grav);
var _default = ForwardRef;
exports["default"] = _default;