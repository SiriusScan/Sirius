"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.sliderPropTypes = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _getWidth = _interopRequireDefault(require("dom-lib/getWidth"));

var _getHeight = _interopRequireDefault(require("dom-lib/getHeight"));

var _getOffset = _interopRequireDefault(require("dom-lib/getOffset"));

var _ProgressBar = _interopRequireDefault(require("./ProgressBar"));

var _Handle = _interopRequireDefault(require("./Handle"));

var _Graduated = _interopRequireDefault(require("./Graduated"));

var _utils = require("../utils");

var _utils2 = require("./utils");

var _Plaintext = _interopRequireDefault(require("../Plaintext"));

var sliderPropTypes = {
  min: _propTypes.default.number,
  max: _propTypes.default.number,
  step: _propTypes.default.number,
  value: _propTypes.default.number,
  defaultValue: _propTypes.default.number,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  handleClassName: _propTypes.default.string,
  handleTitle: _propTypes.default.node,
  barClassName: _propTypes.default.string,
  handleStyle: _propTypes.default.object,
  disabled: _propTypes.default.bool,
  plaintext: _propTypes.default.bool,
  readOnly: _propTypes.default.bool,
  graduated: _propTypes.default.bool,
  tooltip: _propTypes.default.bool,
  progress: _propTypes.default.bool,
  vertical: _propTypes.default.bool,
  onChange: _propTypes.default.func,
  onChangeCommitted: _propTypes.default.func,
  renderMark: _propTypes.default.func,
  renderTooltip: _propTypes.default.func,
  getAriaValueText: _propTypes.default.func
};
exports.sliderPropTypes = sliderPropTypes;

var Slider = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var ariaLabel = props['aria-label'],
      ariaLabelledby = props['aria-labelledby'],
      ariaValuetext = props['aria-valuetext'],
      _props$as = props.as,
      Componnet = _props$as === void 0 ? 'div' : _props$as,
      graduated = props.graduated,
      className = props.className,
      barClassName = props.barClassName,
      progress = props.progress,
      vertical = props.vertical,
      disabled = props.disabled,
      readOnly = props.readOnly,
      plaintext = props.plaintext,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'slider' : _props$classPrefix,
      _props$min = props.min,
      min = _props$min === void 0 ? 0 : _props$min,
      handleClassName = props.handleClassName,
      handleStyle = props.handleStyle,
      handleTitle = props.handleTitle,
      _props$tooltip = props.tooltip,
      tooltip = _props$tooltip === void 0 ? true : _props$tooltip,
      _props$step = props.step,
      step = _props$step === void 0 ? 1 : _props$step,
      _props$defaultValue = props.defaultValue,
      defaultValue = _props$defaultValue === void 0 ? 0 : _props$defaultValue,
      valueProp = props.value,
      _props$max = props.max,
      maxProp = _props$max === void 0 ? 100 : _props$max,
      getAriaValueText = props.getAriaValueText,
      renderTooltip = props.renderTooltip,
      renderMark = props.renderMark,
      onChange = props.onChange,
      onChangeCommitted = props.onChangeCommitted,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["aria-label", "aria-labelledby", "aria-valuetext", "as", "graduated", "className", "barClassName", "progress", "vertical", "disabled", "readOnly", "plaintext", "classPrefix", "min", "handleClassName", "handleStyle", "handleTitle", "tooltip", "step", "defaultValue", "value", "max", "getAriaValueText", "renderTooltip", "renderMark", "onChange", "onChangeCommitted"]);
  var barRef = (0, _react.useRef)(null);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var _useCustom = (0, _utils.useCustom)('Slider'),
      rtl = _useCustom.rtl;

  var classes = merge(className, withClassPrefix({
    vertical: vertical,
    disabled: disabled,
    readOnly: readOnly,
    graduated: graduated,
    'with-mark': renderMark
  }));
  var max = (0, _react.useMemo)(function () {
    return (0, _utils2.precisionMath)(Math.floor((maxProp - min) / step) * step + min);
  }, [maxProp, min, step]);
  /**
   * Returns a valid value that does not exceed the specified range of values.
   */

  var getValidValue = (0, _react.useCallback)(function (value) {
    return (0, _utils2.checkValue)(value, min, max);
  }, [max, min]);

  var _useControlled = (0, _utils.useControlled)(getValidValue(valueProp), getValidValue(defaultValue)),
      value = _useControlled[0],
      setValue = _useControlled[1];

  var count = (0, _react.useMemo)(function () {
    return (0, _utils2.precisionMath)((max - min) / step);
  }, [max, min, step]); // Get the height of the progress bar

  var getBarHeight = (0, _react.useCallback)(function () {
    return barRef.current ? (0, _getHeight.default)(barRef.current) : 0;
  }, []); // Get the width of the progress bar

  var getBarWidth = (0, _react.useCallback)(function () {
    return barRef.current ? (0, _getWidth.default)(barRef.current) : 0;
  }, []);
  var getValueByOffset = (0, _react.useCallback)(function (offset) {
    var value = 0;

    if (isNaN(offset)) {
      return value;
    }

    if (vertical) {
      var barHeight = getBarHeight();
      value = Math.round(offset / (barHeight / count)) * step;
    } else {
      var barWidth = getBarWidth();
      value = Math.round(offset / (barWidth / count)) * step;
    }

    return (0, _utils2.precisionMath)(value);
  }, [count, getBarHeight, getBarWidth, step, vertical]);
  /**
   * A value within the valid range is calculated from the position triggered by the event.
   */

  var getValueByPosition = (0, _react.useCallback)(function (event) {
    var barOffset = (0, _getOffset.default)(barRef.current);
    var offset = vertical ? barOffset.top + barOffset.height - event.pageY : event.pageX - barOffset.left;
    var offsetValue = rtl && !vertical ? barOffset.width - offset : offset;
    return getValueByOffset(offsetValue) + min;
  }, [getValueByOffset, min, rtl, vertical]);
  /**
   * Callback function that is fired when the mousemove is triggered
   */

  var handleChangeValue = (0, _react.useCallback)(function (event) {
    if (disabled || readOnly) {
      return;
    }

    var nextValue = getValidValue(getValueByPosition(event));
    setValue(nextValue);
    onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
  }, [disabled, getValidValue, getValueByPosition, onChange, readOnly, setValue]);
  /**
   * Callback function that is fired when the mouseup is triggered
   */

  var handleChangeCommitted = (0, _react.useCallback)(function (event) {
    if (disabled || readOnly) {
      return;
    }

    var nextValue = getValidValue(getValueByPosition(event));
    onChangeCommitted === null || onChangeCommitted === void 0 ? void 0 : onChangeCommitted(nextValue, event);
  }, [disabled, getValidValue, getValueByPosition, onChangeCommitted, readOnly]);
  var handleKeyDown = (0, _react.useCallback)(function (event) {
    var nextValue;
    var increaseKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    var decreaseKey = rtl ? 'ArrowRight' : 'ArrowLeft';

    switch (event.key) {
      case 'Home':
        nextValue = min;
        break;

      case 'End':
        nextValue = max;
        break;

      case increaseKey:
      case 'ArrowUp':
        nextValue = Math.min(max, value + step);
        break;

      case decreaseKey:
      case 'ArrowDown':
        nextValue = Math.max(min, value - step);
        break;

      default:
        return;
    } // Prevent scroll of the page


    event.preventDefault();
    setValue(nextValue);
    onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
  }, [max, min, onChange, rtl, setValue, step, value]);

  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      localeKey: "notSelected",
      ref: ref
    }, value);
  }

  return /*#__PURE__*/_react.default.createElement(Componnet, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes,
    role: "presentation"
  }), /*#__PURE__*/_react.default.createElement("div", {
    ref: barRef,
    className: merge(barClassName, prefix('bar')),
    onClick: handleChangeValue
  }, progress && /*#__PURE__*/_react.default.createElement(_ProgressBar.default, {
    rtl: rtl,
    vertical: vertical,
    start: 0,
    end: (value - min) / (max - min) * 100
  }), graduated && /*#__PURE__*/_react.default.createElement(_Graduated.default, {
    step: step,
    min: min,
    max: max,
    count: count,
    value: value,
    renderMark: renderMark
  })), /*#__PURE__*/_react.default.createElement(_Handle.default, {
    position: (value - min) / (max - min) * 100,
    className: handleClassName,
    style: handleStyle,
    disabled: disabled,
    vertical: vertical,
    tooltip: tooltip,
    rtl: rtl,
    value: value,
    renderTooltip: renderTooltip,
    onDragMove: handleChangeValue,
    onKeyDown: handleKeyDown,
    onDragEnd: handleChangeCommitted,
    tabIndex: disabled || readOnly ? undefined : 0,
    "aria-orientation": vertical ? 'vertical' : 'horizontal',
    "aria-valuenow": value,
    "aria-disabled": disabled,
    "aria-valuetext": getAriaValueText ? getAriaValueText(value) : ariaValuetext,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-valuemax": max,
    "aria-valuemin": min
  }, handleTitle));
});

Slider.displayName = 'Slider';
Slider.propTypes = sliderPropTypes;
var _default = Slider;
exports.default = _default;