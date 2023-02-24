import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface PopoverProps extends WithAsProps {
    /** The title of the component. */
    title?: React.ReactNode;
    /** The component is visible by default. */
    visible?: boolean;
    /** The content full the container */
    full?: boolean;
    /** Whether show the arrow indicator */
    arrow?: boolean;
}
declare const Popover: RsRefForwardingComponent<'div', PopoverProps>;
export default Popover;
