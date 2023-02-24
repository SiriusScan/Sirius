import React from 'react';
import { RsRefForwardingComponent, WithAsProps } from '../@types/common';
export interface MonthDropdownProps extends WithAsProps {
    show?: boolean;
    limitStartYear?: number;
    limitEndYear?: number;
    height?: number;
    width?: number;
    disabledMonth?: (date: Date) => boolean;
}
export interface RowProps {
    /** Index of row */
    index: number;
    /** The List is currently being scrolled */
    isScrolling: boolean;
    /** This row is visible within the List (eg it is not an overscanned row) */
    isVisible: boolean;
    /** Unique key within array of rendered rows */
    key?: any;
    /** Reference to the parent List (instance) */
    parent: any;
    /** Style object to be applied to row (to position it); */
    style?: React.CSSProperties;
}
export declare function isEveryDateInMonth(year: number, month: number, predicate: (date: Date) => boolean): boolean;
declare const MonthDropdown: RsRefForwardingComponent<'div', MonthDropdownProps>;
export default MonthDropdown;
