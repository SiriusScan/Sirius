import React from 'react';
import type { ScrollbarInstance } from '../Scrollbar';
import type { RowDataType } from '../@types/common';
interface ScrollListenerProps {
    rtl: boolean;
    data: readonly RowDataType[];
    height: number;
    getTableHeight: () => number;
    contentHeight: React.MutableRefObject<number>;
    headerHeight: number;
    autoHeight?: boolean;
    tableBodyRef: React.RefObject<HTMLDivElement>;
    scrollbarXRef: React.RefObject<ScrollbarInstance>;
    scrollbarYRef: React.RefObject<ScrollbarInstance>;
    disabledScroll?: boolean;
    loading?: boolean;
    tableRef: React.RefObject<HTMLDivElement>;
    contentWidth: React.MutableRefObject<number>;
    tableWidth: React.MutableRefObject<number>;
    scrollY: React.MutableRefObject<number>;
    minScrollY: React.MutableRefObject<number>;
    minScrollX: React.MutableRefObject<number>;
    scrollX: React.MutableRefObject<number>;
    setScrollX: (v: number) => void;
    setScrollY: (v: number) => void;
    virtualized?: boolean;
    forceUpdatePosition: (extDuration?: number, nextBezier?: string) => void;
    onScroll?: (scrollX: number, scrollY: number) => void;
    onTouchStart?: (event: React.TouchEvent) => void;
    onTouchMove?: (event: React.TouchEvent) => void;
    onTouchEnd?: (event: React.TouchEvent) => void;
}
/**
 * Add scroll, touch, and wheel monitoring events to the table,
 * and update the scroll position of the table.
 * @param props
 * @returns
 */
declare const useScrollListener: (props: ScrollListenerProps) => {
    isScrolling: boolean;
    onScrollHorizontal: (delta: number) => void;
    onScrollVertical: (delta: number, event: any) => void;
    onScrollBody: (event: any) => void;
    onScrollTop: (top?: number) => void;
    onScrollLeft: (left?: number) => void;
    onScrollTo: (coord: {
        x?: number;
        y?: number;
    }) => void;
};
export default useScrollListener;
