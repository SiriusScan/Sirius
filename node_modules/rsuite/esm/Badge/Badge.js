import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from '../utils';
var Badge = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$as = props.as,
      Component = _props$as === void 0 ? 'div' : _props$as,
      contentText = props.content,
      color = props.color,
      className = props.className,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'badge' : _props$classPrefix,
      children = props.children,
      _props$maxCount = props.maxCount,
      maxCount = _props$maxCount === void 0 ? 99 : _props$maxCount,
      rest = _objectWithoutPropertiesLoose(props, ["as", "content", "color", "className", "classPrefix", "children", "maxCount"]);

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      prefix = _useClassNames.prefix,
      merge = _useClassNames.merge;

  var dot = contentText === undefined || contentText === null;
  var classes = merge(className, withClassPrefix(color, {
    independent: !children,
    wrapper: children,
    dot: dot
  }));

  if (contentText === false) {
    return /*#__PURE__*/React.cloneElement(children, {
      ref: ref
    });
  }

  var content = typeof contentText === 'number' && contentText > maxCount ? maxCount + "+" : contentText;

  if (!children) {
    return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
      ref: ref,
      className: classes
    }), content);
  }

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    ref: ref,
    className: classes
  }), children, /*#__PURE__*/React.createElement("div", {
    className: prefix('content')
  }, content));
});
Badge.displayName = 'Badge';
Badge.propTypes = {
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  children: PropTypes.node,
  as: PropTypes.elementType,
  content: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
  maxCount: PropTypes.number,
  color: PropTypes.oneOf(['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'])
};
export default Badge;