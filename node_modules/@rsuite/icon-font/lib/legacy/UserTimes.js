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

function UserTimes(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 36 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M12.571 16c-3.786 0-6.857-3.071-6.857-6.857s3.071-6.857 6.857-6.857 6.857 3.071 6.857 6.857S16.357 16 12.571 16zm19.233 5.714l4.446 4.446c.107.107.161.25.161.411a.555.555 0 01-.161.393l-2.429 2.429a.555.555 0 01-.393.161.566.566 0 01-.411-.161l-4.446-4.446-4.446 4.446a.566.566 0 01-.411.161.555.555 0 01-.393-.161l-2.429-2.429a.555.555 0 01-.161-.393c0-.161.054-.304.161-.411l4.446-4.446-4.446-4.446a.566.566 0 01-.161-.411c0-.143.054-.286.161-.393l2.429-2.429a.555.555 0 01.393-.161c.161 0 .304.054.411.161l4.446 4.446 4.446-4.446a.566.566 0 01.411-.161c.143 0 .286.054.393.161l2.429 2.429c.107.107.161.25.161.393a.566.566 0 01-.161.411zm-8.893 0l-3.232 3.232a2.296 2.296 0 00-.661 1.625c0 .589.232 1.179.661 1.607l1.482 1.482c-.25.036-.518.054-.786.054H4.768C1.911 29.714 0 28 0 25.089c0-4.036.946-10.232 6.179-10.232.286 0 .482.125.696.304 1.714 1.357 3.464 2.179 5.696 2.179s3.982-.821 5.696-2.179c.214-.179.411-.304.696-.304.339 0 .679.036 1.018.107-.589.571-.964 1.036-.964 1.893 0 .607.232 1.196.661 1.625z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(UserTimes);
var _default = ForwardRef;
exports["default"] = _default;