import React from 'react';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface TimelineItemProps extends WithAsProps {
    /** Whether the last item */
    last?: boolean;
    /** Customizing the Timeline item */
    dot?: React.ReactNode;
    /** The content of the component */
    children?: React.ReactNode;
    /** You can use a custom element type for this component */
    as?: React.ElementType;
    /** Customized time of timeline  **/
    time?: React.ReactNode;
}
declare const TimelineItem: RsRefForwardingComponent<'div', TimelineItemProps>;
export default TimelineItem;
