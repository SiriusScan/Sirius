import _extends from "@babel/runtime/helpers/esm/extends";

/**
 * Get the union of the props of the column itself and the props of the custom column
 *
 * e.g.
 * const CustomColumn = React.forwardRef((props, ref) => {
 *   return <Column ref={ref} sortable align="center" flexGrow={1} fullText {...props} />;
 * });
 *
 * <CustomColumn width={100} >
 *   <HeaderCell>Header</HeaderCell>
 *   <Cell>Cell</Cell>
 * </CustomColumn>
 *
 */
export default function getColumnProps(column) {
  var _column$type, _column$type$render, _column$type$render$c;

  var columnDefaultProps = ((_column$type = column['type']) === null || _column$type === void 0 ? void 0 : (_column$type$render = _column$type['render']) === null || _column$type$render === void 0 ? void 0 : (_column$type$render$c = _column$type$render.call(_column$type)) === null || _column$type$render$c === void 0 ? void 0 : _column$type$render$c.props) || {};
  return _extends({}, columnDefaultProps, column === null || column === void 0 ? void 0 : column.props);
}