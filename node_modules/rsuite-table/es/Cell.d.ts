import React from 'react';
import { StandardProps, RowDataType } from './@types/common';
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
    onTreeToggle?: (rowKey?: string | number, rowIndex?: number, rowData?: RowDataType, event?: React.MouseEvent) => void;
    renderTreeToggle?: (expandButton: React.ReactNode, rowData?: RowDataType, expanded?: boolean) => React.ReactNode;
    renderCell?: (contentChildren: any) => React.ReactNode;
}
declare const Cell: React.ForwardRefExoticComponent<InnerCellProps & React.RefAttributes<HTMLDivElement>>;
export default Cell;
