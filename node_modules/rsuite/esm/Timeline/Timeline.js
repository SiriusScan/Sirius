import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import some from 'lodash/some';
import TimelineItem from './TimelineItem';
import { useClassNames, ReactChildren } from '../utils';
var Timeline = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var children = props.children,
      _props$as = props.as,
      Component = _props$as === void 0 ? 'ul' : _props$as,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'timeline' : _props$classPrefix,
      className = props.className,
      _props$align = props.align,
      align = _props$align === void 0 ? 'left' : _props$align,
      endless = props.endless,
      rest = _objectWithoutPropertiesLoose(props, ["children", "as", "classPrefix", "className", "align", "endless"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix;

  var count = React.Children.count(children);
  var withTime = some(React.Children.toArray(children), function (item) {
    var _item$props;

    return item === null || item === void 0 ? void 0 : (_item$props = item.props) === null || _item$props === void 0 ? void 0 : _item$props.time;
  });
  var classes = merge(className, withClassPrefix("align-" + align, {
    endless: endless,
    'with-time': withTime
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), ReactChildren.mapCloneElement(children, function (_child, index) {
    return {
      last: index + 1 === count,
      align: align
    };
  }));
});
Timeline.Item = TimelineItem;
Timeline.displayName = 'Timeline';
Timeline.propTypes = {
  as: PropTypes.elementType,
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  align: PropTypes.oneOf(['left', 'right', 'alternate']),
  endless: PropTypes.bool
};
export default Timeline;