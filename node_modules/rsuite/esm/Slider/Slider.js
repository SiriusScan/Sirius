import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import getWidth from 'dom-lib/getWidth';
import getHeight from 'dom-lib/getHeight';
import getOffset from 'dom-lib/getOffset';
import ProgressBar from './ProgressBar';
import Handle from './Handle';
import Graduated from './Graduated';
import { useClassNames, useControlled, useCustom } from '../utils';
import { precisionMath, checkValue } from './utils';
import Plaintext from '../Plaintext';
export var sliderPropTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  defaultValue: PropTypes.number,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  handleClassName: PropTypes.string,
  handleTitle: PropTypes.node,
  barClassName: PropTypes.string,
  handleStyle: PropTypes.object,
  disabled: PropTypes.bool,
  plaintext: PropTypes.bool,
  readOnly: PropTypes.bool,
  graduated: PropTypes.bool,
  tooltip: PropTypes.bool,
  progress: PropTypes.bool,
  vertical: PropTypes.bool,
  onChange: PropTypes.func,
  onChangeCommitted: PropTypes.func,
  renderMark: PropTypes.func,
  renderTooltip: PropTypes.func,
  getAriaValueText: PropTypes.func
};
var Slider = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["aria-label", "aria-labelledby", "aria-valuetext", "as", "graduated", "className", "barClassName", "progress", "vertical", "disabled", "readOnly", "plaintext", "classPrefix", "min", "handleClassName", "handleStyle", "handleTitle", "tooltip", "step", "defaultValue", "value", "max", "getAriaValueText", "renderTooltip", "renderMark", "onChange", "onChangeCommitted"]);

  var barRef = useRef(null);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var _useCustom = useCustom('Slider'),
      rtl = _useCustom.rtl;

  var classes = merge(className, withClassPrefix({
    vertical: vertical,
    disabled: disabled,
    readOnly: readOnly,
    graduated: graduated,
    'with-mark': renderMark
  }));
  var max = useMemo(function () {
    return precisionMath(Math.floor((maxProp - min) / step) * step + min);
  }, [maxProp, min, step]);
  /**
   * Returns a valid value that does not exceed the specified range of values.
   */

  var getValidValue = useCallback(function (value) {
    return checkValue(value, min, max);
  }, [max, min]);

  var _useControlled = useControlled(getValidValue(valueProp), getValidValue(defaultValue)),
      value = _useControlled[0],
      setValue = _useControlled[1];

  var count = useMemo(function () {
    return precisionMath((max - min) / step);
  }, [max, min, step]); // Get the height of the progress bar

  var getBarHeight = useCallback(function () {
    return barRef.current ? getHeight(barRef.current) : 0;
  }, []); // Get the width of the progress bar

  var getBarWidth = useCallback(function () {
    return barRef.current ? getWidth(barRef.current) : 0;
  }, []);
  var getValueByOffset = useCallback(function (offset) {
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

    return precisionMath(value);
  }, [count, getBarHeight, getBarWidth, step, vertical]);
  /**
   * A value within the valid range is calculated from the position triggered by the event.
   */

  var getValueByPosition = useCallback(function (event) {
    var barOffset = getOffset(barRef.current);
    var offset = vertical ? barOffset.top + barOffset.height - event.pageY : event.pageX - barOffset.left;
    var offsetValue = rtl && !vertical ? barOffset.width - offset : offset;
    return getValueByOffset(offsetValue) + min;
  }, [getValueByOffset, min, rtl, vertical]);
  /**
   * Callback function that is fired when the mousemove is triggered
   */

  var handleChangeValue = useCallback(function (event) {
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

  var handleChangeCommitted = useCallback(function (event) {
    if (disabled || readOnly) {
      return;
    }

    var nextValue = getValidValue(getValueByPosition(event));
    onChangeCommitted === null || onChangeCommitted === void 0 ? void 0 : onChangeCommitted(nextValue, event);
  }, [disabled, getValidValue, getValueByPosition, onChangeCommitted, readOnly]);
  var handleKeyDown = useCallback(function (event) {
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
    return /*#__PURE__*/React.createElement(Plaintext, {
      localeKey: "notSelected",
      ref: ref
    }, value);
  }

  return /*#__PURE__*/React.createElement(Componnet, _extends({}, rest, {
    ref: ref,
    className: classes,
    role: "presentation"
  }), /*#__PURE__*/React.createElement("div", {
    ref: barRef,
    className: merge(barClassName, prefix('bar')),
    onClick: handleChangeValue
  }, progress && /*#__PURE__*/React.createElement(ProgressBar, {
    rtl: rtl,
    vertical: vertical,
    start: 0,
    end: (value - min) / (max - min) * 100
  }), graduated && /*#__PURE__*/React.createElement(Graduated, {
    step: step,
    min: min,
    max: max,
    count: count,
    value: value,
    renderMark: renderMark
  })), /*#__PURE__*/React.createElement(Handle, {
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
export default Slider;