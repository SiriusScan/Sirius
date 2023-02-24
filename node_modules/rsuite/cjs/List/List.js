"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _useSortHelper2 = _interopRequireDefault(require("./helper/useSortHelper"));

var _utils = require("../utils");

var _ListContext = _interopRequireDefault(require("./ListContext"));

var _ListItem = _interopRequireDefault(require("./ListItem"));

var List = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'list' : _props$classPrefix,
      className = props.className,
      bordered = props.bordered,
      hover = props.hover,
      _props$size = props.size,
      size = _props$size === void 0 ? 'md' : _props$size,
      sortable = props.sortable,
      _props$autoScroll = props.autoScroll,
      autoScroll = _props$autoScroll === void 0 ? true : _props$autoScroll,
      _props$pressDelay = props.pressDelay,
      pressDelay = _props$pressDelay === void 0 ? 0 : _props$pressDelay,
      _props$transitionDura = props.transitionDuration,
      transitionDuration = _props$transitionDura === void 0 ? 300 : _props$transitionDura,
      children = props.children,
      onSort = props.onSort,
      onSortEnd = props.onSortEnd,
      onSortMove = props.onSortMove,
      onSortStart = props.onSortStart,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "bordered", "hover", "size", "sortable", "autoScroll", "pressDelay", "transitionDuration", "children", "onSort", "onSortEnd", "onSortMove", "onSortStart"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var _useSortHelper = (0, _useSortHelper2.default)({
    autoScroll: autoScroll,
    onSort: onSort,
    onSortEnd: onSortEnd,
    onSortMove: onSortMove,
    onSortStart: onSortStart,
    pressDelay: pressDelay,
    transitionDuration: transitionDuration
  }),
      containerRef = _useSortHelper.containerRef,
      register = _useSortHelper.register,
      sorting = _useSortHelper.sorting,
      handleEnd = _useSortHelper.handleEnd,
      handleStart = _useSortHelper.handleStart;

  var classes = merge(className, withClassPrefix({
    bordered: bordered,
    sortable: sortable,
    sorting: sorting,
    hover: hover
  }));
  var contextValue = (0, _react.useMemo)(function () {
    return {
      bordered: bordered,
      size: size,
      register: register
    };
  }, [bordered, register, size]);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "list"
  }, rest, {
    ref: (0, _utils.mergeRefs)(containerRef, ref),
    className: classes,
    onMouseDown: sortable ? handleStart : undefined,
    onMouseUp: sortable ? handleEnd : undefined
  }), /*#__PURE__*/_react.default.createElement(_ListContext.default.Provider, {
    value: contextValue
  }, children));
});

List.Item = _ListItem.default;
List.displayName = 'List';
List.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  bordered: _propTypes.default.bool,
  hover: _propTypes.default.bool,
  sortable: _propTypes.default.bool,
  size: _propTypes.default.oneOf(['lg', 'md', 'sm']),
  autoScroll: _propTypes.default.bool,
  pressDelay: _propTypes.default.number,
  transitionDuration: _propTypes.default.number,
  onSortStart: _propTypes.default.func,
  onSortMove: _propTypes.default.func,
  onSortEnd: _propTypes.default.func,
  onSort: _propTypes.default.func
};
var _default = List;
exports.default = _default;