import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useClassNames, useControlled } from '../utils';
export var PanelGroupContext = /*#__PURE__*/React.createContext({});
var PanelGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "accordion", "defaultActiveKey", "bordered", "className", "classPrefix", "children", "activeKey", "onSelect"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var _useControlled = useControlled(activeProp, defaultActiveKey),
      activeKey = _useControlled[0],
      setActiveKey = _useControlled[1];

  var classes = merge(className, withClassPrefix({
    accordion: accordion,
    bordered: bordered
  }));
  var handleSelect = useCallback(function (activeKey, event) {
    setActiveKey(activeKey);
    onSelect === null || onSelect === void 0 ? void 0 : onSelect(activeKey, event);
  }, [onSelect, setActiveKey]);
  var contextValue = useMemo(function () {
    return {
      accordion: accordion,
      activeKey: activeKey,
      onGroupSelect: handleSelect
    };
  }, [accordion, activeKey, handleSelect]);
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    role: accordion ? 'tablist' : undefined,
    className: classes
  }), /*#__PURE__*/React.createElement(PanelGroupContext.Provider, {
    value: contextValue
  }, children));
});
PanelGroup.displayName = 'PanelGroup';
PanelGroup.propTypes = {
  accordion: PropTypes.bool,
  activeKey: PropTypes.any,
  bordered: PropTypes.bool,
  defaultActiveKey: PropTypes.any,
  className: PropTypes.string,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  onSelect: PropTypes.func
};
export default PanelGroup;