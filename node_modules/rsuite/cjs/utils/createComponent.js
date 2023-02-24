"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _kebabCase = _interopRequireDefault(require("lodash/kebabCase"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

/**
 * Create a component with `classPrefix` and `as` attributes.
 */
function createComponent(_ref) {
  var name = _ref.name,
      componentAs = _ref.componentAs,
      componentClassPrefix = _ref.componentClassPrefix,
      defaultProps = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["name", "componentAs", "componentClassPrefix"]);

  var Component = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
    var _props$as = props.as,
        Component = _props$as === void 0 ? componentAs || 'div' : _props$as,
        _props$classPrefix = props.classPrefix,
        classPrefix = _props$classPrefix === void 0 ? componentClassPrefix || (0, _kebabCase.default)(name) : _props$classPrefix,
        className = props.className,
        role = props.role,
        rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "role"]);

    var _useClassNames = (0, _utils.useClassNames)(classPrefix),
        withClassPrefix = _useClassNames.withClassPrefix,
        merge = _useClassNames.merge;

    var classes = merge(className, withClassPrefix());
    return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, defaultProps, rest, {
      role: role,
      ref: ref,
      className: classes
    }));
  });

  Component.displayName = name;
  Component.propTypes = {
    as: _propTypes.default.elementType,
    className: _propTypes.default.string,
    classPrefix: _propTypes.default.string,
    children: _propTypes.default.node
  };
  return Component;
}

var _default = createComponent;
exports.default = _default;