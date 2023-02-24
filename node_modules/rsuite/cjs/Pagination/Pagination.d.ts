import React from 'react';
import { RsRefForwardingComponent, WithAsProps, TypeAttributes } from '../@types/common';
import { PaginationLocale } from '../locales';
export interface PaginationProps extends WithAsProps {
    /** Current page number */
    activePage?: number;
    /** Page buttons display the maximum number of */
    maxButtons?: number;
    /** Displays the first page */
    first?: boolean | React.ReactNode;
    /** Displays the last page */
    last?: boolean | React.ReactNode;
    /** Displays the prev page */
    prev?: boolean | React.ReactNode;
    /** Displays the next page */
    next?: boolean | React.ReactNode;
    /** Total pages */
    pages?: number;
    /** Disabled component */
    disabled?: boolean | ((eventKey: number | string) => boolean);
    /** Show border paging buttons 1 and pages */
    boundaryLinks?: boolean;
    /** Displays the ellipsis */
    ellipsis?: boolean | React.ReactNode;
    /** Customizes the element type for the component */
    linkAs?: React.ElementType;
    /** Additional props passed as-is to the underlying link for non-active items */
    linkProps?: Record<string, any>;
    /** Custom locale */
    locale?: PaginationLocale;
    /** A pagination can have different sizes */
    size?: TypeAttributes.Size;
    /** callback function for pagination clicked */
    onSelect?: (eventKey: string | number, event: React.MouseEvent) => void;
}
declare const Pagination: RsRefForwardingComponent<'div', PaginationProps>;
export default Pagination;
