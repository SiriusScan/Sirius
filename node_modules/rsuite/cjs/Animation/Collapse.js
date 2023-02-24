"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.DIMENSION = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _getStyle = _interopRequireDefault(require("dom-lib/getStyle"));

var _addStyle = _interopRequireDefault(require("dom-lib/addStyle"));

var _get = _interopRequireDefault(require("lodash/get"));

var _capitalize = _interopRequireDefault(require("lodash/capitalize"));

var _Transition = _interopRequireWildcard(require("./Transition"));

var _utils = require("../utils");

var DIMENSION;
exports.DIMENSION = DIMENSION;

(function (DIMENSION) {
  DIMENSION["HEIGHT"] = "height";
  DIMENSION["WIDTH"] = "width";
})(DIMENSION || (exports.DIMENSION = DIMENSION = {}));

var triggerBrowserReflow = function triggerBrowserReflow(node) {
  return (0, _get.default)(node, 'offsetHeight');
};

var MARGINS = {
  height: ['marginTop', 'marginBottom'],
  width: ['marginLeft', 'marginRight']
};

function defaultGetDimensionValue(dimension, elem) {
  var value = (0, _get.default)(elem, "offset" + (0, _capitalize.default)(dimension));
  var margins = MARGINS[dimension];
  return value + parseInt((0, _getStyle.default)(elem, margins[0]), 10) + parseInt((0, _getStyle.default)(elem, margins[1]), 10);
}

function getScrollDimensionValue(elem, dimension) {
  var value = (0, _get.default)(elem, "scroll" + (0, _capitalize.default)(dimension));
  return value + "px";
}

var Collapse = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var className = props.className,
      _props$timeout = props.timeout,
      timeout = _props$timeout === void 0 ? 300 : _props$timeout,
      _props$dimension = props.dimension,
      dimensionProp = _props$dimension === void 0 ? DIMENSION.HEIGHT : _props$dimension,
      exitedClassName = props.exitedClassName,
      exitingClassName = props.exitingClassName,
      enteredClassName = props.enteredClassName,
      enteringClassName = props.enteringClassName,
      _props$getDimensionVa = props.getDimensionValue,
      getDimensionValue = _props$getDimensionVa === void 0 ? defaultGetDimensionValue : _props$getDimensionVa,
      onEnter = props.onEnter,
      onEntering = props.onEntering,
      onEntered = props.onEntered,
      onExit = props.onExit,
      onExiting = props.onExiting,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["className", "timeout", "dimension", "exitedClassName", "exitingClassName", "enteredClassName", "enteringClassName", "getDimensionValue", "onEnter", "onEntering", "onEntered", "onExit", "onExiting"]);

  var _useClassNames = (0, _utils.useClassNames)('anim'),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var dimension = typeof dimensionProp === 'function' ? dimensionProp() : dimensionProp;
  var handleEnter = (0, _react.useCallback)(function (elem) {
    (0, _addStyle.default)(elem, dimension, 0);
  }, [dimension]);
  var handleEntering = (0, _react.useCallback)(function (elem) {
    (0, _addStyle.default)(elem, dimension, getScrollDimensionValue(elem, dimension));
  }, [dimension]);
  var handleEntered = (0, _react.useCallback)(function (elem) {
    (0, _addStyle.default)(elem, dimension, 'auto');
  }, [dimension]);
  var handleExit = (0, _react.useCallback)(function (elem) {
    var value = getDimensionValue ? getDimensionValue(dimension, elem) : 0;
    (0, _addStyle.default)(elem, dimension, value + "px");
  }, [dimension, getDimensionValue]);
  var handleExiting = (0, _react.useCallback)(function (elem) {
    triggerBrowserReflow(elem);
    (0, _addStyle.default)(elem, dimension, 0);
  }, [dimension]);
  return /*#__PURE__*/_react.default.createElement(_Transition.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    timeout: timeout,
    className: merge(className, prefix({
      'collapse-horizontal': dimension === 'width'
    })),
    exitedClassName: exitedClassName || prefix('collapse'),
    exitingClassName: exitingClassName || prefix('collapsing'),
    enteredClassName: enteredClassName || prefix('collapse', 'in'),
    enteringClassName: enteringClassName || prefix('collapsing'),
    onEnter: (0, _utils.createChainedFunction)(handleEnter, onEnter),
    onEntering: (0, _utils.createChainedFunction)(handleEntering, onEntering),
    onEntered: (0, _utils.createChainedFunction)(handleEntered, onEntered),
    onExit: (0, _utils.createChainedFunction)(handleExit, onExit),
    onExiting: (0, _utils.createChainedFunction)(handleExiting, onExiting)
  }));
});

Collapse.displayName = 'Collapse';
Collapse.propTypes = (0, _extends2.default)({}, _Transition.transitionPropTypes, {
  dimension: _propTypes.default.any,
  getDimensionValue: _propTypes.default.func
});
var _default = Collapse;
exports.default = _default;