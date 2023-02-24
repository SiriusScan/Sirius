import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useRef, useCallback, useEffect } from 'react';
import omit from 'lodash/omit';
import addStyle from 'dom-lib/addStyle';
import getWidth from 'dom-lib/getWidth';
import { getDOMNode, mergeRefs, useElementResize, useClassNames } from '../utils';
var omitProps = ['placement', 'arrowOffsetLeft', 'arrowOffsetTop', 'positionLeft', 'positionTop', 'getPositionInstance', 'getToggleInstance', 'autoWidth'];
var resizePlacement = ['topStart', 'topEnd', 'leftEnd', 'rightEnd', 'auto', 'autoVerticalStart', 'autoVerticalEnd', 'autoHorizontalEnd'];
var PickerOverlay = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'picker-menu' : _props$classPrefix,
      autoWidth = props.autoWidth,
      className = props.className,
      _props$placement = props.placement,
      placement = _props$placement === void 0 ? 'bottomStart' : _props$placement,
      target = props.target,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "autoWidth", "className", "placement", "target"]);

  var overlayRef = useRef(null);
  var handleResize = useCallback(function () {
    var instance = target === null || target === void 0 ? void 0 : target.current;

    if (instance && resizePlacement.includes(placement)) {
      instance.updatePosition();
    }
  }, [target, placement]);
  useElementResize(useCallback(function () {
    return overlayRef.current;
  }, []), handleResize);
  useEffect(function () {
    var toggle = target === null || target === void 0 ? void 0 : target.current;

    if (autoWidth && toggle !== null && toggle !== void 0 && toggle.root) {
      // Get the width value of the button,
      // and then set it to the menu to make their width consistent.
      var width = getWidth(getDOMNode(toggle.root));

      if (overlayRef.current) {
        addStyle(overlayRef.current, 'min-width', width + "px");
      }
    }
  }, [autoWidth, target, overlayRef]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix());
  return /*#__PURE__*/React.createElement(Component, _extends({}, omit(rest, omitProps), {
    ref: mergeRefs(overlayRef, ref),
    className: classes
  }));
});
PickerOverlay.displayName = 'PickerOverlay';
export default PickerOverlay;