"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.ContainerContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var ContainerContext = /*#__PURE__*/_react.default.createContext({});

exports.ContainerContext = ContainerContext;

var Container = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'section' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'container' : _props$classPrefix,
      className = props.className,
      children = props.children,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "children"]);

  var _useState = (0, _react.useState)(false),
      hasSidebar = _useState[0],
      setHasSidebar = _useState[1];

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    'has-sidebar': hasSidebar
  }));
  var contextValue = (0, _react.useMemo)(function () {
    return {
      setHasSidebar: setHasSidebar
    };
  }, [setHasSidebar]);
  return /*#__PURE__*/_react.default.createElement(ContainerContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), children));
});

Container.displayName = 'Container';
Container.propTypes = {
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string
};
var _default = Container;
exports.default = _default;