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

function Trash2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12 12.665v12c0 .192-.059.354-.185.478s-.286.187-.48.187H9.998c-.194 0-.354-.062-.478-.187s-.187-.286-.187-.478v-12a.66.66 0 01.187-.48.663.663 0 01.478-.187h1.335c.194 0 .357.064.48.187a.641.641 0 01.187.48zm5.333 0v12c0 .192-.062.354-.187.478s-.286.187-.478.187h-1.335c-.194 0-.354-.062-.48-.187s-.185-.288-.185-.478v-12a.66.66 0 01.185-.48.669.669 0 01.48-.187h1.335c.194 0 .354.064.478.187a.649.649 0 01.187.48zm5.332 0v12a.655.655 0 01-.185.478.653.653 0 01-.482.187h-1.333a.64.64 0 01-.665-.665v-12c0-.194.062-.354.187-.48a.654.654 0 01.478-.187h1.333c.197 0 .357.064.482.187a.66.66 0 01.185.48zm2.67 15.086V7.998H6.665v19.751c0 .304.05.587.146.843.096.258.197.443.304.562.105.119.176.174.217.174h17.333c.041 0 .117-.055.217-.174.103-.121.203-.306.302-.562.103-.254.151-.539.151-.841zM11.333 5.335h9.333l-1.001-2.439a.587.587 0 00-.354-.231h-6.603a.586.586 0 00-.352.229l-1.022 2.441zM30.667 6v1.335a.645.645 0 01-.187.478.65.65 0 01-.482.187h-1.995v19.751c0 1.152-.327 2.151-.981 2.99-.649.841-1.435 1.264-2.354 1.259H7.335c-.917 0-1.703-.405-2.354-1.218C4.327 29.973 4 28.983 4 27.836V8.001H2.002a.656.656 0 01-.48-.187.65.65 0 01-.19-.478V6.001c0-.197.062-.357.187-.48a.643.643 0 01.48-.185h6.439l1.458-3.481c.21-.514.585-.951 1.127-1.314.542-.361 1.09-.539 1.646-.539h6.665c.551 0 1.104.178 1.646.539s.917.8 1.127 1.314l1.458 3.479h6.437a.635.635 0 01.665.667z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Trash2);
var _default = ForwardRef;
exports["default"] = _default;