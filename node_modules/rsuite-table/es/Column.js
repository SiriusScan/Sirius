import PropTypes from 'prop-types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Column(_props) {
  return null;
}

var propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  width: PropTypes.number,
  fixed: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['left', 'right'])]),
  resizable: PropTypes.bool,
  sortable: PropTypes.bool,
  flexGrow: PropTypes.number,
  minWidth: PropTypes.number,
  colSpan: PropTypes.number,
  rowSpan: PropTypes.func,
  treeCol: PropTypes.bool,
  onResize: PropTypes.func,
  children: PropTypes.node,
  fullText: PropTypes.bool
};
Column.displayName = 'Table.Column';
Column.defaultProps = {
  width: 100
};
Column.propTypes = propTypes;
export var columnHandledProps = Object.keys(propTypes);
export default Column;