"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.InputGroupContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _InputGroupAddon = _interopRequireDefault(require("./InputGroupAddon"));

var _InputGroupButton = _interopRequireDefault(require("./InputGroupButton"));

var _utils = require("../utils");

var InputGroupContext = /*#__PURE__*/_react.default.createContext(null);

exports.InputGroupContext = InputGroupContext;

var InputGroup = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'input-group' : _props$classPrefix,
      className = props.className,
      disabled = props.disabled,
      inside = props.inside,
      size = props.size,
      children = props.children,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "disabled", "inside", "size", "children"]);

  var _useState = (0, _react.useState)(false),
      focus = _useState[0],
      setFocus = _useState[1];

  var handleFocus = (0, _react.useCallback)(function () {
    setFocus(true);
  }, []);
  var handleBlur = (0, _react.useCallback)(function () {
    setFocus(false);
  }, []);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix(size, {
    inside: inside,
    focus: focus,
    disabled: disabled
  }));

  var disabledChildren = function disabledChildren() {
    return _react.default.Children.map(children, function (item) {
      if ( /*#__PURE__*/_react.default.isValidElement(item)) {
        return /*#__PURE__*/_react.default.cloneElement(item, {
          disabled: true
        });
      }

      return item;
    });
  };

  var contextValue = (0, _react.useMemo)(function () {
    return {
      onFocus: handleFocus,
      onBlur: handleBlur
    };
  }, [handleFocus, handleBlur]);
  return /*#__PURE__*/_react.default.createElement(InputGroupContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), disabled ? disabledChildren() : children));
});

InputGroup.displayName = 'InputGroup';
InputGroup.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  children: _propTypes.default.node,
  disabled: _propTypes.default.bool,
  inside: _propTypes.default.bool,
  size: _propTypes.default.oneOf(['lg', 'md', 'sm', 'xs'])
};
InputGroup.Addon = _InputGroupAddon.default;
InputGroup.Button = _InputGroupButton.default;
var _default = InputGroup;
exports.default = _default;