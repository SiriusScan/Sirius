import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames, PROGRESS_STATUS_ICON } from '../utils';
var ProgressLine = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "percent", "strokeColor", "strokeWidth", "trailColor", "trailWidth", "status", "showInfo", "classPrefix", "vertical"]);

  var _useClassNames = useClassNames(classPrefix),
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
  var info = showIcon ? /*#__PURE__*/React.createElement("span", {
    className: prefix("icon-" + (status || ''))
  }, PROGRESS_STATUS_ICON[status]) : /*#__PURE__*/React.createElement("span", {
    className: prefix('info-status')
  }, percent, "%");
  return /*#__PURE__*/React.createElement(Component, _extends({
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": percent
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/React.createElement("div", {
    className: prefix('line-outer')
  }, /*#__PURE__*/React.createElement("div", {
    className: prefix('line-inner'),
    style: lineInnerStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: prefix('line-bg'),
    style: percentStyle
  }))), showInfo ? /*#__PURE__*/React.createElement("div", {
    className: prefix('info')
  }, info) : null);
});
ProgressLine.displayName = 'ProgressLine';
ProgressLine.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  percent: PropTypes.number,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  trailColor: PropTypes.string,
  trailWidth: PropTypes.number,
  showInfo: PropTypes.bool,
  vertical: PropTypes.bool,
  status: PropTypes.oneOf(['success', 'fail', 'active'])
};
export default ProgressLine;