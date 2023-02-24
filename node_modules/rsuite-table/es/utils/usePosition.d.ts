import React from 'react';
import type { RowDataType } from '../@types/common';
interface PositionProps {
    data: readonly RowDataType[];
    height: number;
    tableWidth: React.MutableRefObject<number>;
    tableRef: React.RefObject<HTMLDivElement>;
    prefix: (str: string) => string;
    translateDOMPositionXY: React.MutableRefObject<any>;
    wheelWrapperRef: React.RefObject<HTMLDivElement>;
    headerWrapperRef: React.RefObject<HTMLDivElement>;
    affixHeaderWrapperRef: React.RefObject<HTMLDivElement>;
    tableHeaderRef: React.RefObject<HTMLDivElement>;
    scrollX: React.MutableRefObject<number>;
    scrollY: React.MutableRefObject<number>;
    contentWidth: React.MutableRefObject<number>;
    shouldFixedColumn: boolean;
}
/**
 * Update the position of the table according to the scrolling information of the table.
 * @param props
 * @returns
 */
declare const usePosition: (props: PositionProps) => {
    forceUpdatePosition: (nextDuration?: number, nextBezier?: string) => void;
};
export default usePosition;
