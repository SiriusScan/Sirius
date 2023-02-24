import React from 'react';
import { FixedType } from './ColumnResizeHandler';
import { InnerCellProps } from './Cell';
export interface HeaderCellProps extends InnerCellProps {
    index?: number;
    minWidth?: number;
    sortColumn?: string;
    sortType?: 'desc' | 'asc';
    sortable?: boolean;
    resizable?: boolean;
    groupHeader?: boolean;
    flexGrow?: number;
    fixed?: boolean | 'left' | 'right';
    children: React.ReactNode;
    onResize?: (columnWidth?: number, dataKey?: string) => void;
    onSortColumn?: (dataKey?: string) => void;
    onColumnResizeStart?: (columnWidth?: number, left?: number, fixed?: boolean) => void;
    onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: FixedType) => void;
    onColumnResizeEnd?: (columnWidth?: number, cursorDelta?: number, dataKey?: any, index?: number) => void;
    renderSortIcon?: (sortType?: 'desc' | 'asc') => React.ReactNode;
}
declare const HeaderCell: React.ForwardRefExoticComponent<HeaderCellProps & React.RefAttributes<HTMLDivElement>>;
export default HeaderCell;
