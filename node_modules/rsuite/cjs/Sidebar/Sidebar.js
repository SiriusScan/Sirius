"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var _Container = require("../Container/Container");

var Sidebar = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'aside' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'sidebar' : _props$classPrefix,
      className = props.className,
      collapsible = props.collapsible,
      _props$width = props.width,
      width = _props$width === void 0 ? 260 : _props$width,
      style = props.style,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "classPrefix", "className", "collapsible", "width", "style"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    collapse: collapsible
  }));

  var _useContext = (0, _react.useContext)(_Container.ContainerContext),
      setHasSidebar = _useContext.setHasSidebar;

  (0, _react.useEffect)(function () {
    /** Notify the Container that the Sidebar is in the child node of the Container. */
    setHasSidebar === null || setHasSidebar === void 0 ? void 0 : setHasSidebar(true);
  }, [setHasSidebar]);
  var styles = (0, _extends2.default)({
    flex: "0 0 " + width + "px",
    width: width
  }, style);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes,
    style: styles
  }));
});

Sidebar.displayName = 'Sidebar';
Sidebar.propTypes = {
  className: _propTypes.default.string,
  classPrefix: _propTypes.default.string,
  width: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  collapsible: _propTypes.default.bool,
  style: _propTypes.default.object
};
var _default = Sidebar;
exports.default = _default;