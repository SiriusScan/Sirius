"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.PanelGroupContext = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = require("../utils");

var PanelGroupContext = /*#__PURE__*/_react.default.createContext({});

exports.PanelGroupContext = PanelGroupContext;

var PanelGroup = /*#__PURE__*/_react.default.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      accordion = props.accordion,
      defaultActiveKey = props.defaultActiveKey,
      bordered = props.bordered,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'panel-group' : _props$classPrefix,
      children = props.children,
      activeProp = props.activeKey,
      onSelect = props.onSelect,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["as", "accordion", "defaultActiveKey", "bordered", "className", "classPrefix", "children", "activeKey", "onSelect"]);

  var _useClassNames = (0, _utils.useClassNames)(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var _useControlled = (0, _utils.useControlled)(activeProp, defaultActiveKey),
      activeKey = _useControlled[0],
      setActiveKey = _useControlled[1];

  var classes = merge(className, withClassPrefix({
    accordion: accordion,
    bordered: bordered
  }));
  var handleSelect = (0, _react.useCallback)(function (activeKey, event) {
    setActiveKey(activeKey);
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(activeKey, event);
  }, [onSelect, setActiveKey]);
  var contextValue = (0, _react.useMemo)(function () {
    return {
      accordion: accordion,
      activeKey: activeKey,
      onGroupSelect: handleSelect
    };
  }, [accordion, activeKey, handleSelect]);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    role: accordion ? 'tablist' : undefined,
    className: classes
  }), /*#__PURE__*/_react.default.createElement(PanelGroupContext.Provider, {
    value: contextValue
  }, children));
});

PanelGroup.displayName = 'PanelGroup';
PanelGroup.propTypes = {
  accordion: _propTypes.default.bool,
  activeKey: _propTypes.default.any,
  bordered: _propTypes.default.bool,
  defaultActiveKey: _propTypes.default.any,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  classPrefix: _propTypes.default.string,
  onSelect: _propTypes.default.func
};
var _default = PanelGroup;
exports.default = _default;