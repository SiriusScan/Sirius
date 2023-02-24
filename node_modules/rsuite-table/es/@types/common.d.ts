/// <reference types="react" />
export interface StandardProps extends React.HTMLAttributes<HTMLElement> {
    /** The prefix of the component CSS class */
    classPrefix?: string;
    /** Additional classes */
    className?: string;
    /** Primary content */
    children?: React.ReactNode;
    /** Additional style */
    style?: React.CSSProperties;
}
export declare type SortType = 'desc' | 'asc';
export declare type TableSizeChangeEventName = 'bodyHeightChanged' | 'bodyWidthChanged' | 'widthChanged' | 'heightChanged';
export interface RowDataType {
    dataKey?: string;
    children?: RowDataType[];
    [key: string]: any;
}
export declare type RowKeyType = string | number;
export interface TableLocaleType {
    emptyMessage?: string;
    loading?: string;
}
export declare type ListenerCallback = {
    off: () => void;
};
export declare type ElementOffset = {
    top: number;
    left: number;
    width: number;
    height: number;
};
