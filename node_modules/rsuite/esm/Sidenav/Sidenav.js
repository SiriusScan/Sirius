import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import remove from 'lodash/remove';
import Transition from '../Animation/Transition';
import shallowEqual from '../utils/shallowEqual';
import SidenavBody from './SidenavBody';
import SidenavHeader from './SidenavHeader';
import SidenavToggle from './SidenavToggle';
import { useClassNames, useControlled, mergeRefs } from '../utils';
import deprecatePropType from '../utils/deprecatePropType';
export var SidenavContext = /*#__PURE__*/React.createContext(null);
var emptyArray = [];
var Sidenav = /*#__PURE__*/React.forwardRef(function (props, ref) {
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
      rest = _objectWithoutPropertiesLoose(props, ["as", "className", "classPrefix", "appearance", "expanded", "activeKey", "defaultOpenKeys", "openKeys", "onSelect", "onOpenChange"]);

  var _useControlled = useControlled(openKeysProp, defaultOpenKeys),
      openKeys = _useControlled[0],
      setOpenKeys = _useControlled[1];

  var _useClassNames = useClassNames(classPrefix),
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix(appearance));
  var handleOpenChange = useCallback(function (eventKey, event) {
    var find = function find(key) {
      return shallowEqual(key, eventKey);
    };

    var nextOpenKeys = [].concat(openKeys);

    if (nextOpenKeys.some(find)) {
      remove(nextOpenKeys, find);
    } else {
      nextOpenKeys.push(eventKey);
    }

    setOpenKeys(nextOpenKeys);
    onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(nextOpenKeys, event);
  }, [onOpenChange, openKeys, setOpenKeys]);
  var contextValue = useMemo(function () {
    return {
      expanded: expanded,
      activeKey: activeKey,
      sidenav: true,
      openKeys: openKeys !== null && openKeys !== void 0 ? openKeys : [],
      onOpenChange: handleOpenChange,
      onSelect: onSelect
    };
  }, [activeKey, expanded, handleOpenChange, onSelect, openKeys]);
  return /*#__PURE__*/React.createElement(SidenavContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Transition, {
    in: expanded,
    timeout: 300,
    exitedClassName: prefix('collapse-out'),
    exitingClassName: prefix('collapse-out', 'collapsing'),
    enteredClassName: prefix('collapse-in'),
    enteringClassName: prefix('collapse-in', 'collapsing')
  }, function (transitionProps, transitionRef) {
    var className = transitionProps.className,
        transitionRest = _objectWithoutPropertiesLoose(transitionProps, ["className"]);

    return /*#__PURE__*/React.createElement(Component, _extends({}, rest, transitionRest, {
      ref: mergeRefs(ref, transitionRef),
      className: merge(classes, className)
    }));
  }));
});
Sidenav.Header = SidenavHeader;
Sidenav.Body = SidenavBody;
Sidenav.Toggle = SidenavToggle;
Sidenav.displayName = 'Sidenav';
Sidenav.propTypes = {
  as: PropTypes.elementType,
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  expanded: PropTypes.bool,
  appearance: PropTypes.oneOf(['default', 'inverse', 'subtle']),
  defaultOpenKeys: PropTypes.array,
  openKeys: PropTypes.array,
  onOpenChange: PropTypes.func,
  activeKey: deprecatePropType(PropTypes.any, 'Use `activeKey` on <Nav> component instead'),
  onSelect: deprecatePropType(PropTypes.func, 'Use `onSelect` on <Nav> component instead')
};
export default Sidenav;