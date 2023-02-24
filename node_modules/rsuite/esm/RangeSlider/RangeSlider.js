import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import getWidth from 'dom-lib/getWidth';
import getHeight from 'dom-lib/getHeight';
import getOffset from 'dom-lib/getOffset';
import { useClassNames, useCustom, useControlled, useEventCallback } from '../utils';
import { sliderPropTypes } from '../Slider/Slider';
import ProgressBar from '../Slider/ProgressBar';
import Handle from '../Slider/Handle';
import Graduated from '../Slider/Graduated';
import { precisionMath, checkValue } from '../Slider/utils';
import { tupleType } from '../utils/propTypeChecker';
var defaultDefaultValue = [0, 0];
var RangeSlider = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var ariaLabel = props['aria-label'],
      ariaLabelledby = props['aria-labelledby'],
      ariaValuetext = props['aria-valuetext'],
      _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      barClassName = props.barClassName,
      className = props.className,
      constraint = props.constraint,
      _props$defaultValue = props.defaultValue,
      defaultValue = _props$defaultValue === void 0 ? defaultDefaultValue : _props$defaultValue,
      graduated = props.graduated,
      _props$progress = props.progress,
      progress = _props$progress === void 0 ? true : _props$progress,
      vertical = props.vertical,
      disabled = props.disabled,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'slider' : _props$classPrefix,
      _props$min = props.min,
      min = _props$min === void 0 ? 0 : _props$min,
      _props$max = props.max,
      maxProp = _props$max === void 0 ? 100 : _props$max,
      _props$step = props.step,
      step = _props$step === void 0 ? 1 : _props$step,
      valueProp = props.value,
      handleClassName = props.handleClassName,
      handleStyle = props.handleStyle,
      handleTitle = props.handleTitle,
      _props$tooltip = props.tooltip,
      tooltip = _props$tooltip === void 0 ? true : _props$tooltip,
      getAriaValueText = props.getAriaValueText,
      renderTooltip = props.renderTooltip,
      renderMark = props.renderMark,
      onChange = props.onChange,
      onChangeCommitted = props.onChangeCommitted,
      rest = _objectWithoutPropertiesLoose(props, ["aria-label", "aria-labelledby", "aria-valuetext", "as", "barClassName", "className", "constraint", "defaultValue", "graduated", "progress", "vertical", "disabled", "classPrefix", "min", "max", "step", "value", "handleClassName", "handleStyle", "handleTitle", "tooltip", "getAriaValueText", "renderTooltip", "renderMark", "onChange", "onChangeCommitted"]);

  var barRef = useRef(null); // Define the parameter position of the handle

  var handleIndexs = useRef([0, 1]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var _useCustom = useCustom('RangeSlider'),
      rtl = _useCustom.rtl;

  var classes = merge(className, withClassPrefix({
    vertical: vertical,
    disabled: disabled,
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
    if (typeof value === 'undefined') {
      return;
    }

    return [checkValue(value[0], min, max), checkValue(value[1], min, max)];
  }, [max, min]);

  var _useControlled = useControlled(getValidValue(valueProp), getValidValue(defaultValue)),
      value = _useControlled[0],
      setValue = _useControlled[1]; // The count of values ​​that can be entered.


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
    var val = 0;

    if (isNaN(offset)) {
      return val;
    }

    if (vertical) {
      var barHeight = getBarHeight();
      val = Math.round(offset / (barHeight / count)) * step;
    } else {
      var barWidth = getBarWidth();
      val = Math.round(offset / (barWidth / count)) * step;
    }

    return precisionMath(val);
  }, [count, getBarHeight, getBarWidth, step, vertical]);
  var getValueByPosition = useCallback(function (event) {
    var barOffset = getOffset(barRef.current);
    var offset = vertical ? barOffset.top + barOffset.height - event.pageY : event.pageX - barOffset.left;
    var val = rtl && !vertical ? barOffset.width - offset : offset;
    return getValueByOffset(val) + min;
  }, [getValueByOffset, min, rtl, vertical]);
  var getRangeValue = useCallback(function (value, key, event) {
    // Get the corresponding value according to the cursor position
    var v = getValueByPosition(event); // Judge the handle key and put the corresponding value at the start or end.

    if (key === 'start') {
      return [v, value[1]];
    } else if (key === 'end') {
      return [value[0], v];
    }

    return value;
  }, [getValueByPosition]);
  var getNextValue = useCallback(function (event, dataset) {
    var eventKey = dataset.key,
        range = dataset.range;
    var value = range.split(',').map(function (i) {
      return +i;
    });
    var nextValue = getValidValue(getRangeValue(value, eventKey, event));

    if (nextValue[0] >= nextValue[1]) {
      /**
       * When the value of `start` is greater than the value of` end`,
       * the position of the handle is reversed.
       */
      handleIndexs.current.reverse();

      if (eventKey === 'start') {
        nextValue[0] = value[1];
      } else {
        nextValue[1] = value[0];
      }
    }

    return nextValue;
  }, [getRangeValue, getValidValue]);
  /**
   * Whether a range is valid against given constraint (if any)
   * Should check before every `setValue` calls
   */

  var isRangeMatchingConstraint = useCallback(function (range) {
    // If no constraint is defined, any range is valid
    if (!constraint) return true;
    return constraint(range);
  }, [constraint]);
  /**
   * Callback function that is fired when the mousemove is triggered
   */

  var handleDragMove = useEventCallback(function (event, dataset) {
    var nextValue = getNextValue(event, dataset);

    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
    }
  });
  /**
   * Callback function that is fired when the mouseup is triggered
   */

  var handleChangeCommitted = useCallback(function (event, dataset) {
    var nextValue = getNextValue(event, dataset);

    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChangeCommitted === null || onChangeCommitted === void 0 ? void 0 : onChangeCommitted(nextValue, event);
    }
  }, [getNextValue, onChangeCommitted, isRangeMatchingConstraint, setValue]);
  var handleKeyDown = useCallback(function (event) {
    var _event$target;

    var _event$target$dataset = (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target['dataset'],
        key = _event$target$dataset.key;

    var nextValue = [].concat(value);
    var increaseKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    var decreaseKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    var valueIndex = key === 'start' ? 0 : 1;

    switch (event.key) {
      case 'Home':
        nextValue[valueIndex] = min;
        break;

      case 'End':
        nextValue[valueIndex] = max;
        break;

      case increaseKey:
      case 'ArrowUp':
        nextValue[valueIndex] = Math.min(max, value[valueIndex] + step);
        break;

      case decreaseKey:
      case 'ArrowDown':
        nextValue[valueIndex] = Math.max(min, value[valueIndex] - step);
        break;

      default:
        return;
    } // When the start value is greater than the end value, let the handle and value switch positions.


    if (nextValue[0] >= nextValue[1]) {
      nextValue.reverse();
      handleIndexs.current.reverse();
    } // Prevent scroll of the page


    event.preventDefault();

    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
    }
  }, [max, min, onChange, rtl, isRangeMatchingConstraint, setValue, step, value]);
  var handleClick = useCallback(function (event) {
    if (disabled) {
      return;
    }

    var start = value[0],
        end = value[1];
    var v = getValueByPosition(event); //  Judging that the current click value is closer to the values ​​of `start` and` end`.

    if (Math.abs(start - v) < Math.abs(end - v)) {
      start = v;
    } else {
      end = v;
    }

    var nextValue = getValidValue([start, end].sort(function (a, b) {
      return a - b;
    }));

    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 ? void 0 : onChange(nextValue, event);
    }
  }, [disabled, getValidValue, getValueByPosition, isRangeMatchingConstraint, onChange, setValue, value]);
  var handleProps = useMemo(function () {
    return [{
      value: value[0],
      'data-key': 'start',
      'aria-valuenow': value[0],
      'aria-valuetext': getAriaValueText ? getAriaValueText(value[0], 'start') : ariaValuetext,
      position: (value[0] - min) / (max - min) * 100
    }, {
      value: value[1],
      'data-key': 'end',
      'aria-valuenow': value[1],
      'aria-valuetext': getAriaValueText ? getAriaValueText(value[1], 'end') : ariaValuetext,
      position: (value[1] - min) / (max - min) * 100
    }];
  }, [ariaValuetext, getAriaValueText, max, min, value]);
  var handleCommonProps = {
    rtl: rtl,
    disabled: disabled,
    vertical: vertical,
    tooltip: tooltip,
    className: handleClassName,
    style: handleStyle,
    renderTooltip: renderTooltip,
    onDragMove: handleDragMove,
    onDragEnd: handleChangeCommitted,
    onKeyDown: handleKeyDown,
    tabIndex: disabled ? undefined : 0,
    'aria-orientation': vertical ? 'vertical' : 'horizontal',
    'aria-disabled': disabled,
    'aria-valuemax': max,
    'aria-valuemin': min,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby
  };
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/React.createElement("div", {
    className: merge(barClassName, prefix('bar')),
    ref: barRef,
    onClick: handleClick
  }, progress && /*#__PURE__*/React.createElement(ProgressBar, {
    rtl: rtl,
    vertical: vertical,
    start: (value[0] - min) / (max - min) * 100,
    end: (value[1] - min) / (max - min) * 100
  }), graduated && /*#__PURE__*/React.createElement(Graduated, {
    step: step,
    min: min,
    max: max,
    count: count,
    value: value,
    renderMark: renderMark
  })), /*#__PURE__*/React.createElement(Handle, _extends({
    "data-range": value
  }, handleCommonProps, handleProps[handleIndexs.current[0]]), handleTitle), /*#__PURE__*/React.createElement(Handle, _extends({
    "data-range": value
  }, handleCommonProps, handleProps[handleIndexs.current[1]]), handleTitle));
});
RangeSlider.displayName = 'RangeSlider';
RangeSlider.propTypes = _extends({}, sliderPropTypes, {
  value: tupleType(PropTypes.number.isRequired, PropTypes.number.isRequired),
  defaultValue: tupleType(PropTypes.number.isRequired, PropTypes.number.isRequired)
});
export default RangeSlider;