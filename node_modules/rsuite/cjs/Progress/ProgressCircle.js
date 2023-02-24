"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var ProgressCircle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _withClassPrefix;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$strokeWidth = props.strokeWidth,
      strokeWidth = _props$strokeWidth === void 0 ? 6 : _props$strokeWidth,
      _props$trailWidth = props.trailWidth,
      trailWidth = _props$trailWidth === void 0 ? 6 : _props$trailWidth,
      _props$percent = props.percent,
      percent = _props$percent === void 0 ? 0 : _props$percent,
      _props$strokeLinecap = props.strokeLinecap,
      strokeLinecap = _props$strokeLinecap === void 0 ? 'round' : _props$strokeLinecap,
      className = props.className,
      _props$showInfo = props.showInfo,
      showInfo = _props$showInfo === void 0 ? true : _props$showInfo,
      status = props.status,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'progress' : _props$classPrefix,
      style = props.style,
      _props$gapDegree = props.gapDegree,
      gapDegree = _props$gapDegree === void 0 ? 0 : _props$gapDegree,
      _props$gapPosition = props.gapPosition,
      gapPosition = _props$gapPosition === void 0 ? 'top' : _props$gapPosition,
      trailColor = props.trailColor,
      strokeColor = props.strokeColor,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "strokeWidth", "trailWidth", "percent", "strokeLinecap", "className", "showInfo", "status", "classPrefix", "style", "gapDegree", "gapPosition", "trailColor", "strokeColor"]);
  var getPathStyles = (0, _react.useCallback)(function () {
    var radius = 50 - strokeWidth / 2;
    var x1 = 0;
    var y1 = -radius;
    var x2 = 0;
    var y2 = -2 * radius;

    switch (gapPosition) {
      case 'left':
        x1 = -radius;
        y1 = 0;
        x2 = 2 * radius;
        y2 = 0;
        break;

      case 'right':
        x1 = radius;
        y1 = 0;
        x2 = -2 * radius;
        y2 = 0;
        break;

      case 'bottom':
        y1 = radius;
        y2 = 2 * radius;
        break;

      default:
    }

    var pathString = "M 50,50 m " + x1 + "," + y1 + " a " + radius + "," + radius + " 0 1 1 " + x2 + "," + -y2 + " a " + radius + "," + radius + " 0 1 1 " + -x2 + "," + y2;
    var len = Math.PI * 2 * radius;
    var trailPathStyle = {
      stroke: trailColor,
      strokeDasharray: len - gapDegree + "px " + len + "px",
      strokeDashoffset: "-" + gapDegree / 2 + "px"
    };
    var strokePathStyle = {
      stroke: strokeColor,
      strokeDasharray: percent / 100 * (len - gapDegree) + "px " + len + "px",
      strokeDashoffset: "-" + gapDegree / 2 + "px"
    };
    return {
      pathString: pathString,
      trailPathStyle: trailPathStyle,
      strokePathStyle: strokePathStyle
    };
  }, [gapDegree, gapPosition, percent, strokeColor, strokeWidth, trailColor]);

  var _getPathStyles = getPathStyles(),
      pathString = _getPathStyles.pathString,
      trailPathStyle = _getPathStyles.trailPathStyle,
      strokePathStyle = _getPathStyles.strokePathStyle;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix('circle', (_withClassPrefix = {}, _withClassPrefix["circle-" + (status || '')] = !!status, _withClassPrefix)));
  var showIcon = status && status !== 'active';
  var info = showIcon ? /*#__PURE__*/_react.default.createElement("span", {
    className: prefix("icon-" + (status || ''))
  }, _utils.PROGRESS_STATUS_ICON[status]) : /*#__PURE__*/_react.default.createElement("span", {
    key: 1
  }, percent, "%");
  return /*#__PURE__*/_react.default.createElement(Component, {
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": percent,
    ref: ref,
    className: classes,
    style: style
  }, showInfo ? /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('circle-info')
  }, info) : null, /*#__PURE__*/_react.default.createElement("svg", (0, _extends2.default)({
    className: prefix('svg'),
    viewBox: "0 0 100 100"
  }, rest), /*#__PURE__*/_react.default.createElement("path", {
    className: prefix('trail'),
    d: pathString,
    strokeWidth: trailWidth || strokeWidth,
    fillOpacity: "0",
    style: trailPathStyle
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: pathString,
    strokeLinecap: strokeLinecap,
    className: prefix('stroke'),
    strokeWidth: percent === 0 ? 0 : strokeWidth,
    fillOpacity: "0",
    style: strokePathStyle
  })));
});

ProgressCircle.displayName = 'ProgressCircle';
ProgressCircle.propTypes = {
  className: _propTypes.default.string,
  strokeColor: _propTypes.default.string,
  strokeLinecap: _propTypes.default.oneOf(['butt', 'round', 'square']),
  trailColor: _propTypes.default.string,
  percent: _propTypes.default.number,
  strokeWidth: _propTypes.default.number,
  trailWidth: _propTypes.default.number,
  gapDegree: _propTypes.default.number,
  gapPosition: _propTypes.default.oneOf(['top', 'bottom', 'left', 'right']),
  showInfo: _propTypes.default.bool,
  status: _propTypes.default.oneOf(['success', 'fail', 'active']),
  classPrefix: _propTypes.default.string
};
var _default = ProgressCircle;
exports.default = _default;