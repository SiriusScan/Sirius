import { PaginationProps } from './Pagination';
import { RsRefForwardingComponent } from '../@types/common';
declare type LayoutType = 'total' | '-' | 'pager' | '|' | 'limit' | 'skip';
export interface PaginationGroupProps extends PaginationProps {
    /** Customize the layout of a paging component */
    layout?: LayoutType[];
    /** Customizes the options of the rows per page select field. */
    limitOptions?: number[];
    /** Customize the layout of a paging component */
    limit?: number;
    /** Total number of data entries */
    total: number;
    /** Callback fired when the page is changed */
    onChangePage?: (page: number) => void;
    /** Callback fired when the number of rows per page is changed */
    onChangeLimit?: (limit: number) => void;
}
declare const PaginationGroup: RsRefForwardingComponent<'div', PaginationGroupProps>;
export default PaginationGroup;
