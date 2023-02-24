"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var ProgressLine = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _lineInnerStyle, _percentStyle, _withClassPrefix;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      className = props.className,
      _props$percent = props.percent,
      percent = _props$percent === void 0 ? 0 : _props$percent,
      strokeColor = props.strokeColor,
      strokeWidth = props.strokeWidth,
      trailColor = props.trailColor,
      trailWidth = props.trailWidth,
      status = props.status,
      _props$showInfo = props.showInfo,
      showInfo = _props$showInfo === void 0 ? true : _props$showInfo,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'progress' : _props$classPrefix,
      vertical = props.vertical,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "percent", "strokeColor", "strokeWidth", "trailColor", "trailWidth", "status", "showInfo", "classPrefix", "vertical"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var lineInnerStyle = (_lineInnerStyle = {
    backgroundColor: trailColor
  }, _lineInnerStyle[vertical ? 'width' : 'height'] = trailWidth || strokeWidth, _lineInnerStyle);
  var percentStyle = (_percentStyle = {}, _percentStyle[vertical ? 'height' : 'width'] = percent + "%", _percentStyle.backgroundColor = strokeColor, _percentStyle[vertical ? 'width' : 'height'] = strokeWidth, _percentStyle);
  var classes = merge(className, withClassPrefix('line', (_withClassPrefix = {
    'line-vertical': vertical
  }, _withClassPrefix["line-" + status] = !!status, _withClassPrefix)));
  var showIcon = status && status !== 'active';
  var info = showIcon ? /*#__PURE__*/_react.default.createElement("span", {
    className: prefix("icon-" + (status || ''))
  }, _utils.PROGRESS_STATUS_ICON[status]) : /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('info-status')
  }, percent, "%");
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": percent
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('line-outer')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('line-inner'),
    style: lineInnerStyle
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('line-bg'),
    style: percentStyle
  }))), showInfo ? /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('info')
  }, info) : null);
});

ProgressLine.displayName = 'ProgressLine';
ProgressLine.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  percent: _propTypes.default.number,
  strokeColor: _propTypes.default.string,
  strokeWidth: _propTypes.default.number,
  trailColor: _propTypes.default.string,
  trailWidth: _propTypes.default.number,
  showInfo: _propTypes.default.bool,
  vertical: _propTypes.default.bool,
  status: _propTypes.default.oneOf(['success', 'fail', 'active'])
};
var _default = ProgressLine;
exports.default = _default;