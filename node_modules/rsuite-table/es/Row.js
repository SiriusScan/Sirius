import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["classPrefix", "height", "headerHeight", "className", "width", "top", "style", "isHeaderRow", "rowRef", "children", "rowSpan"];
import React, { useContext } from 'react';
import { mergeRefs, useClassNames } from './utils';
import TableContext from './TableContext';
var Row = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'row' : _props$classPrefix,
      _props$height = props.height,
      height = _props$height === void 0 ? 46 : _props$height,
      _props$headerHeight = props.headerHeight,
      headerHeight = _props$headerHeight === void 0 ? 40 : _props$headerHeight,
      className = props.className,
      width = props.width,
      top = props.top,
      style = props.style,
      isHeaderRow = props.isHeaderRow,
      rowRef = props.rowRef,
      children = props.children,
      rowSpan = props.rowSpan,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  var _useContext = useContext(TableContext),
      translateDOMPositionXY = _useContext.translateDOMPositionXY;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix({
    header: isHeaderRow,
    rowspan: rowSpan
  }));

  var styles = _extends({
    minWidth: width,
    height: isHeaderRow ? headerHeight : height
  }, style);

  translateDOMPositionXY === null || translateDOMPositionXY === void 0 ? void 0 : translateDOMPositionXY(styles, 0, top);
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "row"
  }, rest, {
    ref: mergeRefs(rowRef, ref),
    className: classes,
    style: styles
  }), children);
});
Row.displayName = 'Table.Row';
export default Row;