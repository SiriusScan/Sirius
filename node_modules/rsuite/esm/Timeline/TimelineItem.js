import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var TimelineItem = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'li' : _props$as,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'timeline-item' : _props$classPrefix,
      last = props.last,
      className = props.className,
      dot = props.dot,
      time = props.time,
      rest = _objectWithoutPropertiesLoose(props, ["as", "children", "classPrefix", "last", "className", "dot", "time"]);

  var _useClassNames = useClassNames(classPrefix),
      merge = _useClassNames.merge,
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix({
    last: last
  }));
  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/React.createElement("span", {
    className: prefix('tail')
  }), /*#__PURE__*/React.createElement("span", {
    className: prefix('dot', {
      'custom-dot': dot
    })
  }, dot), time && /*#__PURE__*/React.createElement("div", {
    className: prefix('time')
  }, time), /*#__PURE__*/React.createElement("div", {
    className: prefix('content')
  }, children));
});
TimelineItem.displayName = 'TimelineItem';
TimelineItem.propTypes = {
  last: PropTypes.bool,
  dot: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
  classPrefix: PropTypes.string,
  as: PropTypes.elementType
};
export default TimelineItem;