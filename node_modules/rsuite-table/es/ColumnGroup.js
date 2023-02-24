import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["header", "className", "children", "classPrefix", "headerHeight", "verticalAlign", "align", "width", "groupHeaderHeight"];
import React from 'react';
import PropTypes from 'prop-types';
import { useClassNames } from './utils';
var ColumnGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var header = props.header,
      className = props.className,
      children = props.children,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'column-group' : _props$classPrefix,
      _props$headerHeight = props.headerHeight,
      headerHeight = _props$headerHeight === void 0 ? 80 : _props$headerHeight,
      verticalAlign = props.verticalAlign,
      align = props.align,
      width = props.width,
      groupHeightProp = props.groupHeaderHeight,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  var groupHeight = typeof groupHeightProp !== 'undefined' ? groupHeightProp : headerHeight / 2;
  var restHeight = typeof groupHeightProp !== 'undefined' ? headerHeight - groupHeightProp : headerHeight / 2;
  var styles = {
    height: groupHeight,
    width: width
  };

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge,
      prefix = _useClassNames.prefix;

  var classes = merge(className, withClassPrefix());

  var contentStyles = _extends({}, styles, {
    textAlign: align,
    verticalAlign: verticalAlign
  });

  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    className: classes
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: prefix('header'),
    style: styles
  }, /*#__PURE__*/React.createElement("div", {
    className: prefix('header-content'),
    style: contentStyles
  }, header)), children ? React.Children.map(children, function (node) {
    return /*#__PURE__*/React.cloneElement(node, {
      className: prefix('cell'),
      predefinedStyle: {
        height: restHeight,
        top: styles.height
      },
      headerHeight: restHeight,
      verticalAlign: node.props.verticalAlign || verticalAlign,
      children: /*#__PURE__*/React.createElement("span", {
        className: prefix('cell-content')
      }, node.props.children)
    });
  }) : null);
});
ColumnGroup.displayName = 'Table.ColumnGroup';
ColumnGroup.propTypes = {
  header: PropTypes.node,
  classPrefix: PropTypes.string,
  groupHeaderHeight: PropTypes.number,
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom'])
};
export default ColumnGroup;