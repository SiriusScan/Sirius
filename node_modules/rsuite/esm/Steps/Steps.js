import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames, ReactChildren } from '../utils';
import StepItem from './StepItem';
var Steps = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'steps' : _props$classPrefix,
      className = props.className,
      children = props.children,
      vertical = props.vertical,
      small = props.small,
      _props$current = props.current,
      current = _props$current === void 0 ? 0 : _props$current,
      _props$currentStatus = props.currentStatus,
      currentStatus = _props$currentStatus === void 0 ? 'process' : _props$currentStatus,
      rest = _objectWithoutPropertiesLoose(props, ["as", "classPrefix", "className", "children", "vertical", "small", "current", "currentStatus"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix,
      withClassPrefix = _useClassNames.withClassPrefix;

  var horizontal = !vertical;
  var classes = merge(className, withClassPrefix({
    small: small,
    vertical: vertical,
    horizontal: !vertical
  }));
  var count = React.Children.count(children);
  var items = ReactChildren.mapCloneElement(children, function (item, index) {
    var itemStyles = {
      flexBasis: index < count - 1 ? 100 / (count - 1) + "%" : undefined,
      maxWidth: index === count - 1 ? 100 / count + "%" : undefined
    };

    var itemProps = _extends({
      stepNumber: index + 1,
      status: 'wait',
      style: horizontal ? itemStyles : undefined
    }, item.props); // fix tail color


    if (currentStatus === 'error' && index === current - 1) {
      itemProps.className = prefix('next-error');
    }

    if (!item.props.status) {
      if (index === current) {
        itemProps.status = currentStatus;
        itemProps.className = merge(itemProps.className, prefix('item-active'));
      } else if (index < current) {
        itemProps.status = 'finish';
      }
    }

    return itemProps;
  });
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), items);
});
Steps.Item = StepItem;
Steps.displayName = 'Steps';
Steps.propTypes = {
  classPrefix: PropTypes.string,
  vertical: PropTypes.bool,
  small: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  current: PropTypes.number,
  currentStatus: PropTypes.oneOf(['finish', 'wait', 'process', 'error'])
};
export default Steps;