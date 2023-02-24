import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import { LAYER_WIDTH } from './constants';
import { useClassNames } from './utils';
import TableContext from './TableContext';
import ArrowRight from '@rsuite/icons/ArrowRight';
import ArrowDown from '@rsuite/icons/ArrowDown';
import { StandardProps, RowDataType } from './@types/common';
import { columnHandledProps } from './Column';

export interface CellProps extends StandardProps {
  /** Data binding key, but also a sort of key */
  dataKey?: string;

  /** Row Number */
  rowIndex?: number;

  /** Row Data */
  rowData?: any;
}

export interface InnerCellProps extends Omit<CellProps, 'children'> {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  isHeaderCell?: boolean;
  width?: number;
  height?: number | ((rowData: RowDataType) => number);
  left?: number;
  headerHeight?: number;
  style?: React.CSSProperties;
  fullText?: boolean;
  firstColumn?: boolean;
  lastColumn?: boolean;
  hasChildren?: boolean;
  children?: React.ReactNode | ((rowData: RowDataType, rowIndex?: number) => React.ReactNode);
  rowKey?: string | number;
  rowSpan?: number;
  depth?: number;
  wordWrap?: boolean | 'break-all' | 'break-word' | 'keep-all';
  removed?: boolean;
  treeCol?: boolean;
  expanded?: boolean;
  predefinedStyle?: React.CSSProperties;
  onTreeToggle?: (
    rowKey?: string | number,
    rowIndex?: number,
    rowData?: RowDataType,
    event?: React.MouseEvent
  ) => void;

  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean
  ) => React.ReactNode;
  renderCell?: (contentChildren: any) => React.ReactNode;
}

const groupKeys = [
  'groupCount',
  'groupHeader',
  'groupHeaderHeight',
  'groupAlign',
  'groupVerticalAlign'
];

const Cell = React.forwardRef((props: InnerCellProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    classPrefix = 'cell',
    width = 0,
    left = 0,
    headerHeight = 36,
    depth = 0,
    height = 36,
    style,
    className,
    fullText,
    firstColumn,
    lastColumn,
    isHeaderCell,
    align,
    children,
    rowData,
    dataKey,
    rowIndex,
    removed,
    rowKey,
    rowSpan,
    wordWrap,
    verticalAlign,
    expanded,
    treeCol,
    hasChildren,
    predefinedStyle,
    renderCell,
    renderTreeToggle,
    onClick,
    onTreeToggle,
    ...rest
  } = props;

  const { rtl, hasCustomTreeCol, isTree } = React.useContext(TableContext);

  const isTreeCol = treeCol || (!hasCustomTreeCol && firstColumn && isTree);
  const cellHeight = typeof height === 'function' ? height(rowData) : height;

  if (isTreeCol && !isHeaderCell && !rowData) {
    throw new Error('[Table.Cell]: `rowData` is required for tree column');
  }

  const handleTreeToggle = useCallback(
    (event: React.MouseEvent) => {
      onTreeToggle?.(rowKey, rowIndex, rowData, event);
    },
    [onTreeToggle, rowData, rowIndex, rowKey]
  );

  const { withClassPrefix, merge, prefix } = useClassNames(classPrefix);
  const classes = merge(
    className,
    withClassPrefix({
      expanded: expanded && isTreeCol,
      first: firstColumn,
      last: lastColumn,
      rowspan: rowSpan && !isHeaderCell,
      'full-text': fullText
    })
  );

  const nextHeight = isHeaderCell ? headerHeight : cellHeight;
  const styles = {
    ...predefinedStyle,
    [fullText ? 'minWidth' : 'width']: width,
    height: nextHeight,
    zIndex: depth,
    [rtl ? 'right' : 'left']: left
  };

  const paddingKey = rtl ? 'paddingRight' : 'paddingLeft';
  const contentStyles: React.CSSProperties = {
    ...style,
    width: fullText ? width - 1 : width,
    height: nextHeight,
    textAlign: align,
    [paddingKey]: isTreeCol ? depth * LAYER_WIDTH + 10 : style?.[paddingKey] || style?.padding
  };

  if (verticalAlign) {
    contentStyles.display = 'table-cell';
    contentStyles.verticalAlign = verticalAlign;
  }

  if (wordWrap) {
    contentStyles.wordBreak = typeof wordWrap === 'boolean' ? 'break-all' : wordWrap;
    contentStyles.overflowWrap = wordWrap === 'break-word' ? wordWrap : undefined;
  }

  let cellContent = isNil(children) && rowData && dataKey ? get(rowData, dataKey) : children;

  if (typeof children === 'function') {
    cellContent = children(rowData, rowIndex);
  }

  const renderTreeNodeExpandIcon = () => {
    const ExpandIconComponent = expanded ? ArrowDown : ArrowRight;
    const expandButton = <ExpandIconComponent className={prefix('expand-icon')} />;

    if (isTreeCol && hasChildren) {
      return (
        <span
          role="button"
          tabIndex={-1}
          className={prefix('expand-wrapper')}
          onClick={handleTreeToggle}
        >
          {renderTreeToggle ? renderTreeToggle(expandButton, rowData, expanded) : expandButton}
        </span>
      );
    }

    return null;
  };

  const content = wordWrap ? (
    <div className={prefix('wrap')}>
      {renderTreeNodeExpandIcon()}
      {renderCell ? renderCell(cellContent) : cellContent}
    </div>
  ) : (
    <>
      {renderTreeNodeExpandIcon()}
      {renderCell ? renderCell(cellContent) : cellContent}
    </>
  );

  if (removed) {
    return null;
  }

  return (
    <div
      ref={ref}
      role={isHeaderCell ? 'columnheader' : 'gridcell'}
      {...omit(rest, [...groupKeys, ...columnHandledProps])}
      onClick={onClick}
      className={classes}
      style={styles}
    >
      <div className={prefix('content')} style={contentStyles}>
        {content}
      </div>
    </div>
  );
});

Cell.displayName = 'Table.Cell';
Cell.propTypes = {
  align: PropTypes.oneOf(['left', 'center', 'right']),
  verticalAlign: PropTypes.oneOf(['top', 'middle', 'bottom']),
  className: PropTypes.string,
  classPrefix: PropTypes.string,
  dataKey: PropTypes.string,
  isHeaderCell: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  left: PropTypes.number,
  headerHeight: PropTypes.number,
  style: PropTypes.object,
  firstColumn: PropTypes.bool,
  lastColumn: PropTypes.bool,
  hasChildren: PropTypes.bool,
  children: PropTypes.any,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  rowIndex: PropTypes.number,
  rowData: PropTypes.object,
  depth: PropTypes.number,
  onTreeToggle: PropTypes.func,
  renderTreeToggle: PropTypes.func,
  renderCell: PropTypes.func,
  wordWrap: PropTypes.any,
  removed: PropTypes.bool,
  treeCol: PropTypes.bool,
  expanded: PropTypes.bool,
  fullText: PropTypes.bool
};

export default Cell;
