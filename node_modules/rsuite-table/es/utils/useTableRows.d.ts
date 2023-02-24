/// <reference types="react" />
import { RowDataType, RowKeyType } from '../@types/common';
interface TableRowsProps {
    prefix: (str: string) => string;
    wordWrap?: boolean | 'break-all' | 'break-word' | 'keep-all';
    data: readonly RowDataType[];
    expandedRowKeys: RowKeyType[];
}
/**
 * The row information of the table, get the DOM of all rows, and summarize the row height.
 * @param props
 * @returns
 */
declare const useTableRows: (props: TableRowsProps) => {
    bindTableRowsRef: (index: number | string, rowData: any) => (ref: HTMLElement) => void;
    tableRowsMaxHeight: number[];
    tableRows: import("react").MutableRefObject<{
        [key: string]: [HTMLElement, any];
    }>;
};
export default useTableRows;
