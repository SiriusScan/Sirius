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

function Hashtag(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M17.696 18.286l1.143-4.571h-4.536l-1.143 4.571h4.536zm13.715-9l-1 4a.574.574 0 01-.554.429h-5.839l-1.143 4.571h5.554c.179 0 .339.089.446.214.107.143.161.321.107.5l-1 4a.56.56 0 01-.554.429h-5.839l-1.446 5.857a.59.59 0 01-.554.429h-4a.633.633 0 01-.464-.214c-.107-.143-.143-.321-.107-.5l1.393-5.571h-4.536l-1.446 5.857a.59.59 0 01-.554.429H5.857a.625.625 0 01-.446-.214c-.107-.143-.143-.321-.107-.5l1.393-5.571H1.143a.594.594 0 01-.446-.214c-.107-.143-.143-.321-.107-.5l1-4a.574.574 0 01.554-.429h5.839l1.143-4.571H3.572a.594.594 0 01-.446-.214c-.107-.143-.161-.321-.107-.5l1-4a.56.56 0 01.554-.429h5.839l1.446-5.857a.595.595 0 01.571-.429h4c.161 0 .339.089.446.214.107.143.143.321.107.5l-1.393 5.571h4.536l1.446-5.857a.595.595 0 01.571-.429h4c.161 0 .339.089.446.214.107.143.143.321.107.5l-1.393 5.571h5.554c.179 0 .339.089.446.214.107.143.143.321.107.5z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Hashtag);
var _default = ForwardRef;
exports["default"] = _default;