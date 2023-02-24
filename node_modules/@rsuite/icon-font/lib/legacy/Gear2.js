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

function Gear2(props, svgRef) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: "1em",
    height: "1em",
    viewBox: "0 0 32 32",
    fill: "currentColor",
    ref: svgRef
  }, props), /*#__PURE__*/React.createElement("path", {
    d: "M16.962 2.334l.377 2.473.215 1.424 1.362.446c.56.181 1.079.393 1.541.629l1.303.67 3.111-2.343a39.788 39.788 0 011.447 1.438c-.087.114-.185.238-.295.375-.551.697-.93 1.193-1.193 1.563L24 10.17l.663 1.269c.295.569.528 1.129.693 1.657l.437 1.394 3.883.594v1.931l-3.84.583-.469 1.319c-.224.635-.446 1.163-.663 1.561l-.686 1.271.825 1.177c.377.542.889 1.216 1.538 2.025a38.6 38.6 0 01-1.074 1.102c-.142.139-.272.261-.382.368l-1.915-1.499-1.189-.926-1.333.695a9.034 9.034 0 01-1.52.633l-1.442.459-.178 1.493a54.318 54.318 0 01-.322 2.395h-1.993l-.377-2.475-.215-1.417-1.362-.448c-.562-.187-1.081-.4-1.538-.631l-1.305-.67-1.17.885-1.927 1.465a33.912 33.912 0 01-1.458-1.438c.087-.114.187-.24.299-.377.551-.702.928-1.195 1.186-1.557l.848-1.182-.69-1.289a8.116 8.116 0 01-.665-1.593l-.409-1.449-1.49-.222-2.427-.357v-1.929l2.453-.37 1.449-.215.432-1.403c.153-.494.366-.997.633-1.486l.693-1.271-.832-1.186a40.95 40.95 0 00-1.522-2.018c.261-.281.603-.633 1.051-1.079l.382-.368L9.003 7.09l1.191.921 1.33-.702a9.68 9.68 0 011.518-.631l1.433-.457.176-1.495a62.57 62.57 0 01.322-2.395h1.991zM18.311.002h-4.626c-.4 0-.649.192-.75.583-.181.69-.382 1.982-.606 3.872-.647.206-1.282.471-1.893.793L7.558 3.019c-.178-.137-.359-.21-.539-.21-.306 0-.962.496-1.968 1.49-1.008.994-1.694 1.739-2.053 2.238-.126.183-.187.343-.187.48 0 .167.071.334.208.501.93 1.127 1.673 2.085 2.231 2.875-.347.64-.617 1.278-.814 1.915l-3.874.587c-.153.027-.283.117-.398.272a.82.82 0 00-.165.478v4.626c0 .181.057.343.167.489a.67.67 0 00.437.261l3.815.562c.194.681.48 1.369.853 2.062-.249.345-.624.837-1.125 1.467a36.363 36.363 0 00-1.065 1.383.813.813 0 00-.167.48c0 .183.046.343.144.48.544.75 1.687 1.913 3.44 3.497a.715.715 0 00.521.229.735.735 0 00.519-.185l2.937-2.231c.567.295 1.195.546 1.874.773l.583 3.833a.615.615 0 00.238.45.783.783 0 00.51.174h4.629c.405 0 .651-.194.752-.583.178-.695.379-1.984.601-3.877a11.458 11.458 0 001.895-.791l2.878 2.249c.192.126.377.187.544.187.304 0 .955-.494 1.954-1.479 1.001-.985 1.691-1.735 2.066-2.249a.698.698 0 00.187-.48.798.798 0 00-.21-.519c-1.001-1.221-1.742-2.181-2.229-2.873.281-.517.549-1.147.811-1.895l3.856-.583a.632.632 0 00.418-.274.791.791 0 00.167-.48v-4.619a.797.797 0 00-.165-.491.669.669 0 00-.439-.261l-3.817-.583a12.013 12.013 0 00-.853-2.039c.249-.35.626-.839 1.127-1.47.503-.631.855-1.093 1.063-1.383a.845.845 0 00.167-.482.691.691 0 00-.146-.455c-.503-.711-1.65-1.89-3.442-3.543a.816.816 0 00-.519-.208.699.699 0 00-.503.183l-2.958 2.231a13.006 13.006 0 00-1.877-.773L19.059.62a.603.603 0 00-.238-.443.785.785 0 00-.512-.176z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.998 12.677a3.321 3.321 0 110 6.646 3.321 3.321 0 010-6.646zm0-2.332A5.655 5.655 0 1016 21.655a5.655 5.655 0 10-.002-11.31z"
  }));
}

var ForwardRef = /*#__PURE__*/React.forwardRef(Gear2);
var _default = ForwardRef;
exports["default"] = _default;