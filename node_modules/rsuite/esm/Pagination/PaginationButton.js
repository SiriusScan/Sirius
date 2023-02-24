import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Ripple from '../Ripple';
import { useClassNames, createChainedFunction } from '../utils';
var PaginationButton = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'button' : _props$as,
      active = props.active,
      disabled = props.disabled,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'pagination-btn' : _props$classPrefix,
      children = props.children,
      eventKey = props.eventKey,
      style = props.style,
      onSelect = props.onSelect,
      onClick = props.onClick,
      rest = _objectWithoutPropertiesLoose(props, ["as", "active", "disabled", "className", "classPrefix", "children", "eventKey", "style", "onSelect", "onClick"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var classes = merge(className, withClassPrefix({
    active: active,
    disabled: disabled
  }));
  var handleClick = useCallback(function (event) {
    if (disabled) {
      return;
    }

    onSelect === null || onSelect === void 0 ? void 0 : onSelect(eventKey, event);
  }, [disabled, eventKey, onSelect]);
  var asProps = {};

  if (typeof Component !== 'string') {
    asProps.eventKey = eventKey;
    asProps.active = active;
  }

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, asProps, {
    disabled: disabled,
    onClick: createChainedFunction(onClick, handleClick),
    ref: ref,
    className: classes,
    style: style
  }), children, !disabled ? /*#__PURE__*/React.createElement(Ripple, null) : null);
});
PaginationButton.displayName = 'PaginationButton';
PaginationButton.propTypes = {
  classPrefix: PropTypes.string,
  eventKey: PropTypes.any,
  onSelect: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  className: PropTypes.string,
  as: PropTypes.elementType,
  children: PropTypes.node,
  style: PropTypes.object,
  renderItem: PropTypes.func
};
export default PaginationButton;