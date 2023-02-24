import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface BreadcrumbItemProps extends WithAsProps<React.ElementType | string> {
    active?: boolean;
    href?: string;
    title?: string;
    target?: string;
}
declare const BreadcrumbItem: RsRefForwardingComponent<'a', BreadcrumbItemProps>;
export default BreadcrumbItem;
