import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["columnLeft", "classPrefix", "height", "className", "style", "columnFixed", "defaultColumnWidth", "minWidth", "onColumnResizeStart", "onColumnResizeMove", "onColumnResizeEnd"];
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import clamp from 'lodash/clamp';
import DOMMouseMoveTracker from 'dom-lib/DOMMouseMoveTracker';
import { useClassNames } from './utils';
import TableContext from './TableContext';
import { RESIZE_MIN_WIDTH } from './constants';
var ColumnResizeHandler = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _extends2;

  var _props$columnLeft = props.columnLeft,
      columnLeft = _props$columnLeft === void 0 ? 0 : _props$columnLeft,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'column-resize-spanner' : _props$classPrefix,
      height = props.height,
      className = props.className,
      style = props.style,
      columnFixed = props.columnFixed,
      defaultColumnWidth = props.defaultColumnWidth,
      minWidth = props.minWidth,
      onColumnResizeStart = props.onColumnResizeStart,
      onColumnResizeMove = props.onColumnResizeMove,
      onColumnResizeEnd = props.onColumnResizeEnd,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  var _useContext = useContext(TableContext),
      rtl = _useContext.rtl;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  var columnWidth = useRef(defaultColumnWidth || 0);
  var mouseMoveTracker = useRef();
  var isKeyDown = useRef();
  var cursorDelta = useRef(0);
  var handleMove = useCallback(function (deltaX) {
    if (!isKeyDown.current) {
      return;
    }

    cursorDelta.current += deltaX;
    columnWidth.current = clamp((defaultColumnWidth || 0) + (rtl ? -cursorDelta.current : cursorDelta.current), minWidth ? Math.max(minWidth, RESIZE_MIN_WIDTH) : RESIZE_MIN_WIDTH, 20000);
    onColumnResizeMove === null || onColumnResizeMove === void 0 ? void 0 : onColumnResizeMove(columnWidth.current, columnLeft, columnFixed);
  }, [columnFixed, columnLeft, defaultColumnWidth, minWidth, onColumnResizeMove, rtl]);
  var handleColumnResizeEnd = useCallback(function () {
    var _mouseMoveTracker$cur, _mouseMoveTracker$cur2;

    isKeyDown.current = false;
    onColumnResizeEnd === null || onColumnResizeEnd === void 0 ? void 0 : onColumnResizeEnd(columnWidth.current, cursorDelta.current);
    (_mouseMoveTracker$cur = mouseMoveTracker.current) === null || _mouseMoveTracker$cur === void 0 ? void 0 : (_mouseMoveTracker$cur2 = _mouseMoveTracker$cur.releaseMouseMoves) === null || _mouseMoveTracker$cur2 === void 0 ? void 0 : _mouseMoveTracker$cur2.call(_mouseMoveTracker$cur);
    mouseMoveTracker.current = null;
  }, [onColumnResizeEnd]);
  var getMouseMoveTracker = useCallback(function () {
    return mouseMoveTracker.current || new DOMMouseMoveTracker(handleMove, handleColumnResizeEnd, document.body);
  }, [handleColumnResizeEnd, handleMove]);
  var handleColumnResizeMouseDown = useCallback(function (event) {
    mouseMoveTracker.current = getMouseMoveTracker();
    mouseMoveTracker.current.captureMouseMoves(event);
    isKeyDown.current = true;
    cursorDelta.current = 0;
    var client = {
      clientX: event.clientX,
      clientY: event.clientY,
      preventDefault: Function()
    };
    onColumnResizeStart === null || onColumnResizeStart === void 0 ? void 0 : onColumnResizeStart(client);
  }, [getMouseMoveTracker, onColumnResizeStart]);
  useEffect(function () {
    return function () {
      var _mouseMoveTracker$cur3;

      (_mouseMoveTracker$cur3 = mouseMoveTracker.current) === null || _mouseMoveTracker$cur3 === void 0 ? void 0 : _mouseMoveTracker$cur3.releaseMouseMoves();
      mouseMoveTracker.current = null;
    };
  }, []);

  if (columnFixed === 'right') {
    return null;
  }

  var styles = _extends((_extends2 = {}, _extends2[rtl ? 'right' : 'left'] = columnWidth.current + columnLeft - 2, _extends2.height = height, _extends2), style);

  return /*#__PURE__*/React.createElement("div", _extends({
    tabIndex: -1,
    role: "button",
    ref: ref
  }, rest, {
    className: classes,
    style: styles,
    onMouseDown: handleColumnResizeMouseDown
  }));
});
ColumnResizeHandler.displayName = 'Table.ColumnResizeHandler';
export default ColumnResizeHandler;