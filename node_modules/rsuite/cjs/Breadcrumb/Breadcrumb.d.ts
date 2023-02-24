import React from 'react';
import BreadcrumbItem from './BreadcrumbItem';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
import { BreadcrumbLocale } from '../locales';
export interface BreadcrumbProps extends WithAsProps {
    /** Shorthand for primary content of the React.ReactNode */
    separator?: React.ReactNode;
    /**
     * Set the maximum number of breadcrumbs to display.
     * When there are more than the maximum number,
     * only the first and last will be shown, with an ellipsis in between.
     * */
    maxItems?: number;
    /** Custom locale */
    locale?: BreadcrumbLocale;
    /** A function to be called when you are in the collapsed view and click the ellipsis. */
    onExpand?: (event: React.MouseEvent) => void;
}
export interface BreadcrumbComponent extends RsRefForwardingComponent<'ol', BreadcrumbProps> {
    Item: typeof BreadcrumbItem;
}
declare const Breadcrumb: BreadcrumbComponent;
export default Breadcrumb;
