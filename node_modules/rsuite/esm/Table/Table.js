import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React from 'react';
import { Table as RsTable, Column, Cell, HeaderCell, ColumnGroup } from 'rsuite-table';
import { useCustom } from '../utils';
var Table = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var localeProp = props.locale,
      _props$loadAnimation = props.loadAnimation,
      loadAnimation = _props$loadAnimation === void 0 ? true : _props$loadAnimation,
      rest = _objectWithoutPropertiesLoose(props, ["locale", "loadAnimation"]);

  var _useCustom = useCustom('Table', localeProp),
      locale = _useCustom.locale,
      rtl = _useCustom.rtl;

  return /*#__PURE__*/React.createElement(RsTable, _extends({}, rest, {
    rtl: rtl,
    ref: ref,
    locale: locale,
    loadAnimation: loadAnimation
  }));
});
Table.Cell = Cell;
Table.Column = Column;
Table.HeaderCell = HeaderCell;
Table.ColumnGroup = ColumnGroup;
Table.displayName = 'Table';
export default Table;