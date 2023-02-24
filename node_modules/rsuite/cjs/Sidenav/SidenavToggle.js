"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _IconButton = _interopRequireDefault(require("../IconButton"));

var _utils = require("../utils");

var _AngleLeft = _interopRequireDefault(require("@rsuite/icons/legacy/AngleLeft"));

var _AngleRight = _interopRequireDefault(require("@rsuite/icons/legacy/AngleRight"));

var _deprecatePropType = _interopRequireDefault(require("../utils/deprecatePropType"));

var _Sidenav = require("./Sidenav");

var SidenavToggle = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var sidenav = (0, _react.useContext)(_Sidenav.SidenavContext);

  if (!sidenav) {
    throw new Error('<Sidenav.Toggle> must be rendered within a <Sidenav>');
  }

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      DEPRECATED_expanded = props.expanded,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'sidenav-toggle' : _props$classPrefix,
      onToggle = props.onToggle,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "expanded", "className", "classPrefix", "onToggle"]); // if `expanded` prop is provided, it takes priority

  var expanded = DEPRECATED_expanded !== null && DEPRECATED_expanded !== void 0 ? DEPRECATED_expanded : sidenav.expanded;

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    collapsed: !expanded
  }));
  var Icon = expanded ? _AngleLeft.default : _AngleRight.default;

  var handleToggle = function handleToggle(event) {
    onToggle === null || onToggle === void 0 ? void 0 : onToggle(!expanded, event);
  };

  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement(_IconButton.default, {
    icon: /*#__PURE__*/_react.default.createElement(Icon, null),
    className: prefix('button'),
    onClick: handleToggle,
    "aria-label": expanded ? 'Collapse' : 'Expand'
  }));
});

SidenavToggle.displayName = 'Sidenav.Toggle';
SidenavToggle.propTypes = {
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  expanded: (0, _deprecatePropType.default)(_propTypes.default.bool, 'Use <Sidenav expanded> instead.'),
  onToggle: _propTypes.default.func
};
var _default = SidenavToggle;
exports.default = _default;