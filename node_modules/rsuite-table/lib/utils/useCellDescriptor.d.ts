import React from 'react';
import { SortType, RowDataType } from '../@types/common';
interface CellDescriptorProps {
    children: React.ReactNode;
    rtl: boolean;
    minScrollX: React.MutableRefObject<number>;
    scrollX: React.MutableRefObject<number>;
    tableWidth: React.MutableRefObject<number>;
    headerHeight: number;
    showHeader: boolean;
    sortType?: SortType;
    defaultSortType?: SortType;
    sortColumn?: string;
    prefix: (str: string) => string;
    onSortColumn?: (dataKey: string, sortType?: SortType) => void;
    onHeaderCellResize?: (width: number, dataKey: string) => void;
    rowHeight?: number | ((rowData?: RowDataType) => number);
    mouseAreaRef: React.RefObject<HTMLDivElement>;
    tableRef: React.RefObject<HTMLDivElement>;
}
interface CellDescriptor {
    columns: React.ReactNode[];
    headerCells: React.ReactNode[];
    bodyCells: React.ReactNode[];
    hasCustomTreeCol: boolean;
    allColumnsWidth: number;
}
/**
 * Attach rendering-related attributes to all cells of the form and cache them.
 * @param props
 * @returns
 */
declare const useCellDescriptor: (props: CellDescriptorProps) => CellDescriptor;
export default useCellDescriptor;
