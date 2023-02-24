import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import getOffset from 'dom-lib/getOffset';
import { mergeRefs, useClassNames, useElementResize, useEventListener, useMount } from '../utils';

/**
 * Get the layout size and offset of the mount element
 */
function useOffset(mountRef) {
  var _useState = useState(null),
      offset = _useState[0],
      setOffset = _useState[1];

  var updateOffset = useCallback(function () {
    setOffset(getOffset(mountRef.current));
  }, [mountRef]); // Update after the element size changes

  useElementResize(function () {
    return mountRef.current;
  }, updateOffset); // Initialize after the first render

  useMount(updateOffset); // Update after window size changes

  useEventListener(window, 'resize', updateOffset, false);
  return offset;
}
/**
 * Get the layout size and offset of the container element
 * @param container
 */


function useContainerOffset(container) {
  var _useState2 = useState(null),
      offset = _useState2[0],
      setOffset = _useState2[1];

  useEffect(function () {
    var node = typeof container === 'function' ? container() : container;
    setOffset(node ? getOffset(node) : null);
  }, [container]);
  return offset;
}
/**
 * Check whether the current element should be in a fixed state.
 * @param offset
 * @param containerOffset
 * @param props
 */


function useFixed(offset, containerOffset, props) {
  var top = props.top,
      onChange = props.onChange;

  var _useState3 = useState(false),
      fixed = _useState3[0],
      setFixed = _useState3[1];

  var handleScroll = useCallback(function () {
    if (!offset) {
      return;
    }

    var scrollY = window.scrollY || window.pageYOffset; // When the scroll distance exceeds the element's top value, it is fixed.

    var nextFixed = scrollY - (Number(offset.top) - Number(top)) >= 0; // If the current element is specified in the container,
    // add to determine whether the current container is in the window range.

    if (containerOffset) {
      nextFixed = nextFixed && scrollY < Number(containerOffset.top) + Number(containerOffset.height);
    }

    if (nextFixed !== fixed) {
      setFixed(nextFixed);
      onChange === null || onChange === void 0 ? void 0 : onChange(nextFixed);
    }
  }, [fixed, offset, containerOffset, onChange, top]); // Add scroll event to window

  useEventListener(window, 'scroll', handleScroll, false);
  return fixed;
}

var Affix = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _merge;

  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'affix' : _props$classPrefix,
      className = props.className,
      children = props.children,
      container = props.container,
      _props$top = props.top,
      top = _props$top === void 0 ? 0 : _props$top,
      onChange = props.onChange,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "children", "container", "top", "onChange"]);

  var mountRef = useRef(null);
  var offset = useOffset(mountRef);
  var containerOffset = useContainerOffset(container);
  var fixed = useFixed(offset, containerOffset, {
    top: top,
    onChange: onChange
  });

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, (_merge = {}, _merge[withClassPrefix()] = fixed, _merge));
  var placeholderStyles = fixed ? {
    width: offset === null || offset === void 0 ? void 0 : offset.width,
    height: offset === null || offset === void 0 ? void 0 : offset.height
  } : undefined;
  var fixedStyles = {
    position: 'fixed',
    top: top,
    width: offset === null || offset === void 0 ? void 0 : offset.width,
    zIndex: 10
  };
  var affixStyles = fixed ? fixedStyles : undefined;
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: mergeRefs(mountRef, ref)
  }), /*#__PURE__*/React.createElement("div", {
    className: classes,
    style: affixStyles
  }, children), fixed && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": true,
    style: placeholderStyles
  }));
});
Affix.displayName = 'Affix';
Affix.propTypes = {
  top: PropTypes.number,
  onChange: PropTypes.func,
  container: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
export default Affix;