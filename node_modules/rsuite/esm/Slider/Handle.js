import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import DOMMouseMoveTracker from 'dom-lib/DOMMouseMoveTracker';
import addStyle from 'dom-lib/addStyle';
import getWidth from 'dom-lib/getWidth';
import Tooltip from '../Tooltip';
import { useClassNames, mergeRefs } from '../utils';
import Input from './Input';
var Handle = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _extends2;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'slider' : _props$classPrefix,
      className = props.className,
      disabled = props.disabled,
      style = props.style,
      children = props.children,
      position = props.position,
      vertical = props.vertical,
      tooltip = props.tooltip,
      rtl = props.rtl,
      value = props.value,
      role = props.role,
      tabIndex = props.tabIndex,
      renderTooltip = props.renderTooltip,
      onDragStart = props.onDragStart,
      onDragMove = props.onDragMove,
      onDragEnd = props.onDragEnd,
      onKeyDown = props.onKeyDown,
      dataRange = props['data-range'],
      dateKey = props['data-key'],
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "disabled", "style", "children", "position", "vertical", "tooltip", "rtl", "value", "role", "tabIndex", "renderTooltip", "onDragStart", "onDragMove", "onDragEnd", "onKeyDown", "data-range", "data-key"]);

  var _useState = useState(false),
      active = _useState[0],
      setActive = _useState[1];

  var rootRef = useRef(null);
  var horizontalKey = rtl ? 'right' : 'left';
  var direction = vertical ? 'bottom' : horizontalKey;

  var styles = _extends({}, style, (_extends2 = {}, _extends2[direction] = position + "%", _extends2));

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var handleClasses = merge(className, prefix('handle'), {
    active: active
  });
  var tooltipRef = useRef(null);
  var mouseMoveTracker = useRef();
  var releaseMouseMoves = useCallback(function () {
    var _mouseMoveTracker$cur;

    (_mouseMoveTracker$cur = mouseMoveTracker.current) === null || _mouseMoveTracker$cur === void 0 ? void 0 : _mouseMoveTracker$cur.releaseMouseMoves();
    mouseMoveTracker.current = null;
  }, []);
  var setTooltipPosition = useCallback(function () {
    var tooltipElement = tooltipRef.current;

    if (tooltip && tooltipElement) {
      var width = getWidth(tooltipElement);
      addStyle(tooltipElement, 'left', "-" + width / 2 + "px");
    }
  }, [tooltip]);
  var handleDragMove = useCallback(function (_deltaX, _deltaY, event) {
    var _mouseMoveTracker$cur2;

    if ((_mouseMoveTracker$cur2 = mouseMoveTracker.current) !== null && _mouseMoveTracker$cur2 !== void 0 && _mouseMoveTracker$cur2.isDragging()) {
      var _rootRef$current;

      onDragMove === null || onDragMove === void 0 ? void 0 : onDragMove(event, (_rootRef$current = rootRef.current) === null || _rootRef$current === void 0 ? void 0 : _rootRef$current.dataset);
      setTooltipPosition();
    }
  }, [onDragMove, setTooltipPosition]);
  var handleDragEnd = useCallback(function (event) {
    var _rootRef$current2;

    setActive(false);
    releaseMouseMoves();
    onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd(event, (_rootRef$current2 = rootRef.current) === null || _rootRef$current2 === void 0 ? void 0 : _rootRef$current2.dataset);
  }, [onDragEnd, releaseMouseMoves]);
  var getMouseMoveTracker = useCallback(function () {
    return mouseMoveTracker.current || new DOMMouseMoveTracker(handleDragMove, handleDragEnd, document.body);
  }, [handleDragEnd, handleDragMove]);
  var handleMouseDown = useCallback(function (event) {
    var _mouseMoveTracker$cur3, _rootRef$current3;

    if (disabled) {
      return;
    }

    mouseMoveTracker.current = getMouseMoveTracker();
    (_mouseMoveTracker$cur3 = mouseMoveTracker.current) === null || _mouseMoveTracker$cur3 === void 0 ? void 0 : _mouseMoveTracker$cur3.captureMouseMoves(event);
    (_rootRef$current3 = rootRef.current) === null || _rootRef$current3 === void 0 ? void 0 : _rootRef$current3.focus();
    setActive(true);
    onDragStart === null || onDragStart === void 0 ? void 0 : onDragStart(event);
  }, [disabled, getMouseMoveTracker, onDragStart]);
  var handleMouseEnter = useCallback(function () {
    setTooltipPosition();
  }, [setTooltipPosition]);
  useEffect(function () {
    return function () {
      releaseMouseMoves();
    };
  }, [releaseMouseMoves]);
  return /*#__PURE__*/React.createElement(Component, {
    role: role,
    tabIndex: tabIndex,
    ref: mergeRefs(ref, rootRef),
    className: handleClasses,
    onMouseDown: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onKeyDown: onKeyDown,
    style: styles,
    "data-range": dataRange,
    "data-key": dateKey
  }, tooltip && /*#__PURE__*/React.createElement(Tooltip, {
    "aria-hidden": "true",
    ref: tooltipRef,
    className: merge(prefix('tooltip'), 'placement-top')
  }, renderTooltip ? renderTooltip(value) : value), /*#__PURE__*/React.createElement(Input, _extends({
    tabIndex: -1,
    value: value
  }, rest)), children);
});
Handle.displayName = 'Handle';
Handle.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  vertical: PropTypes.bool,
  tooltip: PropTypes.bool,
  rtl: PropTypes.bool,
  position: PropTypes.number,
  value: PropTypes.number,
  renderTooltip: PropTypes.func,
  style: PropTypes.object,
  onDragMove: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func
};
export default Handle;