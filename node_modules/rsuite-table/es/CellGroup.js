import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["fixed", "width", "left", "height", "style", "classPrefix", "className", "children"];
import React, { useContext } from 'react';
import { useClassNames } from './utils';
import TableContext from './TableContext';
var CellGroup = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var _withClassPrefix;

  var fixed = props.fixed,
      width = props.width,
      left = props.left,
      height = props.height,
      style = props.style,
      _props$classPrefix = props.classPrefix,
      classPrefix = _props$classPrefix === void 0 ? 'cell-group' : _props$classPrefix,
      className = props.className,
      children = props.children,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  var _useContext = useContext(TableContext),
      translateDOMPositionXY = _useContext.translateDOMPositionXY;

  var _useClassNames = useClassNames(classPrefix),
      withClassPrefix = _useClassNames.withClassPrefix,
      merge = _useClassNames.merge;

  var classes = merge(className, withClassPrefix((_withClassPrefix = {}, _withClassPrefix["fixed-" + fixed] = fixed, _withClassPrefix.scroll = !fixed, _withClassPrefix)));

  var styles = _extends({
    width: width,
    height: height
  }, style);

  translateDOMPositionXY === null || translateDOMPositionXY === void 0 ? void 0 : translateDOMPositionXY(styles, left, 0);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    ref: ref,
    className: classes,
    style: styles
  }), children);
});
CellGroup.displayName = 'Table.CellGroup';
export default CellGroup;