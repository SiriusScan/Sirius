import React from 'react';
import { IconProps } from '@rsuite/icons/lib/Icon';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface StepItemProps extends WithAsProps {
    /** The width of each item. */
    itemWidth?: number | string;
    /** Step status */
    status?: 'finish' | 'wait' | 'process' | 'error';
    /** Set icon */
    icon?: React.ReactElement<IconProps>;
    /** Number of Step */
    stepNumber?: number;
    /** The description of Steps item */
    description?: React.ReactNode;
    /** The title of Steps item */
    title?: React.ReactNode;
}
declare const StepItem: RsRefForwardingComponent<'div', StepItemProps>;
export default StepItem;
