"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends3 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _DOMMouseMoveTracker = _interopRequireDefault(require("dom-lib/DOMMouseMoveTracker"));

var _addStyle = _interopRequireDefault(require("dom-lib/addStyle"));

var _getWidth = _interopRequireDefault(require("dom-lib/getWidth"));

var _Tooltip = _interopRequireDefault(require("../Tooltip"));

var _utils = require("../utils");

var _Input = _interopRequireDefault(require("./Input"));

var Handle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
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
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "disabled", "style", "children", "position", "vertical", "tooltip", "rtl", "value", "role", "tabIndex", "renderTooltip", "onDragStart", "onDragMove", "onDragEnd", "onKeyDown", "data-range", "data-key"]);

  var _useState = (0, _react.useState)(false),
      active = _useState[0],
      setActive = _useState[1];

  var rootRef = (0, _react.useRef)(null);
  var horizontalKey = rtl ? 'right' : 'left';
  var direction = vertical ? 'bottom' : horizontalKey;
  var styles = (0, _extends3.default)({}, style, (_extends2 = {}, _extends2[direction] = position + "%", _extends2));

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var handleClasses = merge(className, prefix('handle'), {
    active: active
  });
  var tooltipRef = (0, _react.useRef)(null);
  var mouseMoveTracker = (0, _react.useRef)();
  var releaseMouseMoves = (0, _react.useCallback)(function () {
    var _mouseMoveTracker$cur;

    (_mouseMoveTracker$cur = mouseMoveTracker.current) === null || _mouseMoveTracker$cur === void 0 ? void 0 : _mouseMoveTracker$cur.releaseMouseMoves();
    mouseMoveTracker.current = null;
  }, []);
  var setTooltipPosition = (0, _react.useCallback)(function () {
    var tooltipElement = tooltipRef.current;

    if (tooltip && tooltipElement) {
      var width = (0, _getWidth.default)(tooltipElement);
      (0, _addStyle.default)(tooltipElement, 'left', "-" + width / 2 + "px");
    }
  }, [tooltip]);
  var handleDragMove = (0, _react.useCallback)(function (_deltaX, _deltaY, event) {
    var _mouseMoveTracker$cur2;

    if ((_mouseMoveTracker$cur2 = mouseMoveTracker.current) !== null && _mouseMoveTracker$cur2 !== void 0 && _mouseMoveTracker$cur2.isDragging()) {
      var _rootRef$current;

      onDragMove === null || onDragMove === void 0 ? void 0 : onDragMove(event, (_rootRef$current = rootRef.current) === null || _rootRef$current === void 0 ? void 0 : _rootRef$current.dataset);
      setTooltipPosition();
    }
  }, [onDragMove, setTooltipPosition]);
  var handleDragEnd = (0, _react.useCallback)(function (event) {
    var _rootRef$current2;

    setActive(false);
    releaseMouseMoves();
    onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd(event, (_rootRef$current2 = rootRef.current) === null || _rootRef$current2 === void 0 ? void 0 : _rootRef$current2.dataset);
  }, [onDragEnd, releaseMouseMoves]);
  var getMouseMoveTracker = (0, _react.useCallback)(function () {
    return mouseMoveTracker.current || new _DOMMouseMoveTracker.default(handleDragMove, handleDragEnd, document.body);
  }, [handleDragEnd, handleDragMove]);
  var handleMouseDown = (0, _react.useCallback)(function (event) {
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
  var handleMouseEnter = (0, _react.useCallback)(function () {
    setTooltipPosition();
  }, [setTooltipPosition]);
  (0, _react.useEffect)(function () {
    return function () {
      releaseMouseMoves();
    };
  }, [releaseMouseMoves]);
  return /*#__PURE__*/_react.default.createElement(Component, {
    role: role,
    tabIndex: tabIndex,
    ref: (0, _utils.mergeRefs)(ref, rootRef),
    className: handleClasses,
    onMouseDown: handleMouseDown,
    onMouseEnter: handleMouseEnter,
    onKeyDown: onKeyDown,
    style: styles,
    "data-range": dataRange,
    "data-key": dateKey
  }, tooltip && /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
    "aria-hidden": "true",
    ref: tooltipRef,
    className: merge(prefix('tooltip'), 'placement-top')
  }, renderTooltip ? renderTooltip(value) : value), /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends3.default)({
    tabIndex: -1,
    value: value
  }, rest)), children);
});

Handle.displayName = 'Handle';
Handle.propTypes = {
  as: _propTypes.default.elementType,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  disabled: _propTypes.default.bool,
  vertical: _propTypes.default.bool,
  tooltip: _propTypes.default.bool,
  rtl: _propTypes.default.bool,
  position: _propTypes.default.number,
  value: _propTypes.default.number,
  renderTooltip: _propTypes.default.func,
  style: _propTypes.default.object,
  onDragMove: _propTypes.default.func,
  onDragStart: _propTypes.default.func,
  onDragEnd: _propTypes.default.func
};
var _default = Handle;
exports.default = _default;