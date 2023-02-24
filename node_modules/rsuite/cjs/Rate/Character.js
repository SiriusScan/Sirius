"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _isNil2 = _interopRequireDefault(require("lodash/isNil"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _contains = _interopRequireDefault(require("dom-lib/contains"));

var _utils = require("../utils");

var _characterStatus;

var characterStatus = (_characterStatus = {}, _characterStatus[0] = 'empty', _characterStatus[0.5] = 'half', _characterStatus[1] = 'full', _characterStatus);

var getKey = function getKey(a, b) {
  return (0, _contains.default)(a, b) ? 'before' : 'after';
};

var Character = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'li' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'rate-character' : _props$classPrefix,
      className = props.className,
      children = props.children,
      vertical = props.vertical,
      status = props.status,
      disabled = props.disabled,
      onClick = props.onClick,
      onKeyDown = props.onKeyDown,
      onMouseMove = props.onMouseMove,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "children", "vertical", "status", "disabled", "onClick", "onKeyDown", "onMouseMove"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var beforeRef = (0, _react.useRef)(null);
  var classes = merge(className, withClassPrefix(!(0, _isNil2.default)(status) && characterStatus[status]));
  var handleMouseMove = (0, _react.useCallback)(function (event) {
    onMouseMove === null || onMouseMove === void 0 ? void 0 : onMouseMove(getKey(beforeRef.current, event.target), event);
  }, [onMouseMove]);
  var handleClick = (0, _react.useCallback)(function (event) {
    onClick === null || onClick === void 0 ? void 0 : onClick(getKey(beforeRef.current, event.target), event);
  }, [onClick]);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes,
    tabIndex: 0,
    onClick: disabled ? null : handleClick,
    onKeyDown: disabled ? null : onKeyDown,
    onMouseMove: disabled ? null : handleMouseMove
  }), /*#__PURE__*/_react.default.createElement("div", {
    ref: beforeRef,
    className: prefix('before', {
      vertical: vertical
    })
  }, children), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('after')
  }, children));
});

Character.displayName = 'Character';
Character.propTypes = {
  as: _propTypes.default.elementType,
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  vertical: _propTypes.default.bool,
  status: _propTypes.default.number,
  disabled: _propTypes.default.bool,
  onMouseMove: _propTypes.default.func,
  onClick: _propTypes.default.func,
  onKeyDown: _propTypes.default.func
};
var _default = Character;
exports.default = _default;