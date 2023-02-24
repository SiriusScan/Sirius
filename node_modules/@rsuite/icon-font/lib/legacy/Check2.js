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

function Check2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M27.095 17.886v6.119c0 1.527-.542 2.832-1.625 3.915s-2.391 1.627-3.915 1.627H5.544c-1.527 0-2.83-.544-3.915-1.627S.002 25.531.002 24.005V7.996c0-1.529.542-2.832 1.625-3.918 1.086-1.083 2.391-1.625 3.918-1.625h16.011c.809 0 1.559.16 2.251.48a.577.577 0 01.345.441.592.592 0 01-.174.558l-.944.944a.605.605 0 01-.443.194.649.649 0 01-.174-.039 3.37 3.37 0 00-.866-.114H5.542c-.846 0-1.573.302-2.174.905a2.959 2.959 0 00-.905 2.174v16.009c0 .848.302 1.57.905 2.176a2.968 2.968 0 002.174.903h16.011c.848 0 1.573-.302 2.174-.903a2.967 2.967 0 00.905-2.176v-4.889c0-.167.057-.306.174-.423l1.232-1.232a.61.61 0 01.443-.192c.075 0 .153.018.231.057.254.103.382.29.384.56zm4.443-9.411L15.874 24.139c-.309.309-.674.462-1.097.462s-.789-.153-1.097-.462l-8.274-8.274c-.309-.311-.462-.674-.462-1.097s.153-.789.464-1.097l2.114-2.114c.309-.309.674-.464 1.097-.464s.789.153 1.097.464l5.061 5.061L27.23 4.168c.306-.309.674-.462 1.097-.462s.789.153 1.097.462l2.117 2.117c.306.304.459.67.459 1.093s-.153.791-.462 1.099z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Check2);
var _default = ForwardRef;
exports["default"] = _default;