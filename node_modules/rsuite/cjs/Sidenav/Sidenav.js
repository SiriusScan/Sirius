"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.SidenavContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _remove = _interopRequireDefault(require("lodash/remove"));

var _Transition = _interopRequireDefault(require("../Animation/Transition"));

var _shallowEqual = _interopRequireDefault(require("../utils/shallowEqual"));

var _SidenavBody = _interopRequireDefault(require("./SidenavBody"));

var _SidenavHeader = _interopRequireDefault(require("./SidenavHeader"));

var _SidenavToggle = _interopRequireDefault(require("./SidenavToggle"));

var _utils = require("../utils");

var _deprecatePropType = _interopRequireDefault(require("../utils/deprecatePropType"));

var SidenavContext = /*#__PURE__*/_react.default.createContext(null);

exports.SidenavContext = SidenavContext;
var emptyArray = [];

var Sidenav = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'nav' : _props$as,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'sidenav' : _props$classPrefix,
      _props$appearance = props.appearance,
      appearance = _props$appearance === void 0 ? 'default' : _props$appearance,
      _props$expanded = props.expanded,
      expanded = _props$expanded === void 0 ? true : _props$expanded,
      activeKey = props.activeKey,
      _props$defaultOpenKey = props.defaultOpenKeys,
      defaultOpenKeys = _props$defaultOpenKey === void 0 ? emptyArray : _props$defaultOpenKey,
      openKeysProp = props.openKeys,
      onSelect = props.onSelect,
      onOpenChange = props.onOpenChange,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "className", "classPrefix", "appearance", "expanded", "activeKey", "defaultOpenKeys", "openKeys", "onSelect", "onOpenChange"]);

  var _useControlled = (0, _utils.useControlled)(openKeysProp, defaultOpenKeys),
      openKeys = _useControlled[0],
      setOpenKeys = _useControlled[1];

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(appearance));
  var handleOpenChange = (0, _react.useCallback)(function (eventKey, event) {
    var find = function find(key) {
      return (0, _shallowEqual.default)(key, eventKey);
    };

    var nextOpenKeys = [].concat(openKeys);

    if (nextOpenKeys.some(find)) {
      (0, _remove.default)(nextOpenKeys, find);
    } else {
      nextOpenKeys.push(eventKey);
    }

    setOpenKeys(nextOpenKeys);
    onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(nextOpenKeys, event);
  }, [onOpenChange, openKeys, setOpenKeys]);
  var contextValue = (0, _react.useMemo)(function () {
    return {
      expanded: expanded,
      activeKey: activeKey,
      sidenav: true,
      openKeys: openKeys !== null && openKeys !== void 0 ? openKeys : [],
      onOpenChange: handleOpenChange,
      onSelect: onSelect
    };
  }, [activeKey, expanded, handleOpenChange, onSelect, openKeys]);
  return /*#__PURE__*/_react.default.createElement(SidenavContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Transition.default, {
    in: expanded,
    timeout: 300,
    exitedClassName: prefix('collapse-out'),
    exitingClassName: prefix('collapse-out', 'collapsing'),
    enteredClassName: prefix('collapse-in'),
    enteringClassName: prefix('collapse-in', 'collapsing')
  }, function (transitionProps, transitionRef) {
    var className = transitionProps.className,
        transitionRest = (0, _objectWithoutPropertiesLoose2.default)(transitionProps, ["className"]);
    return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, transitionRest, {
      ref: (0, _utils.mergeRefs)(ref, transitionRef),
      className: merge(classes, className)
    }));
  }));
});

Sidenav.Header = _SidenavHeader.default;
Sidenav.Body = _SidenavBody.default;
Sidenav.Toggle = _SidenavToggle.default;
Sidenav.displayName = 'Sidenav';
Sidenav.propTypes = {
  as: _propTypes.default.elementType,
  classPrefix: _propTypes.default.string,
  className: _propTypes.default.string,
  expanded: _propTypes.default.bool,
  appearance: _propTypes.default.oneOf(['default', 'inverse', 'subtle']),
  defaultOpenKeys: _propTypes.default.array,
  openKeys: _propTypes.default.array,
  onOpenChange: _propTypes.default.func,
  activeKey: (0, _deprecatePropType.default)(_propTypes.default.any, 'Use `activeKey` on <Nav> component instead'),
  onSelect: (0, _deprecatePropType.default)(_propTypes.default.func, 'Use `onSelect` on <Nav> component instead')
};
var _default = Sidenav;
exports.default = _default;