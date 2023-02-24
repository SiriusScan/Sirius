import React from 'react';
import { TypeAttributes, WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface TooltipProps extends WithAsProps {
    /** Dispaly placement */
    placement?: TypeAttributes.Placement;
    /** Whether visible */
    visible?: boolean;
    /** Primary content */
    children?: React.ReactNode;
    /** Whether show the arrow indicator */
    arrow?: boolean;
}
declare const Tooltip: RsRefForwardingComponent<'div', TooltipProps>;
export default Tooltip;
