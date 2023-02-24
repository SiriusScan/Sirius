import React from 'react';
import { RowDataType, RowKeyType, ElementOffset } from '../@types/common';
interface TableDimensionProps {
    data?: readonly RowDataType[];
    rowHeight: number | ((rowData: RowDataType) => number);
    height: number;
    minHeight: number;
    tableRef?: React.RefObject<HTMLDivElement>;
    headerWrapperRef?: React.RefObject<HTMLDivElement>;
    width?: number;
    prefix: (str: string) => string;
    affixHeader?: boolean | number;
    affixHorizontalScrollbar?: boolean | number;
    headerHeight: number;
    autoHeight?: boolean;
    fillHeight?: boolean;
    children?: React.ReactNode;
    expandedRowKeys?: RowKeyType[];
    showHeader?: boolean;
    onTableScroll?: (coord: {
        x?: number;
        y?: number;
    }) => void;
    onTableResizeChange?: (prevSize: number, event: 'bodyHeightChanged' | 'bodyWidthChanged' | 'widthChanged' | 'heightChanged') => void;
}
/**
 * The dimension information of the table,
 * including the height, width, scrollable distance and the coordinates of the scroll handle, etc.
 * @param props
 * @returns
 */
declare const useTableDimension: (props: TableDimensionProps) => {
    contentHeight: React.MutableRefObject<number>;
    contentWidth: React.MutableRefObject<number>;
    minScrollY: React.MutableRefObject<number>;
    minScrollX: React.MutableRefObject<number>;
    scrollY: React.MutableRefObject<number>;
    scrollX: React.MutableRefObject<number>;
    tableWidth: React.MutableRefObject<number>;
    headerOffset: React.MutableRefObject<ElementOffset | null>;
    tableOffset: React.MutableRefObject<ElementOffset | null>;
    getTableHeight: () => number;
    setScrollY: (value: number) => void;
    setScrollX: (value: number) => void;
};
export default useTableDimension;
