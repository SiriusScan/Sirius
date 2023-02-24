import React from 'react';
import TimelineItem from './TimelineItem';
import { WithAsProps, RsRefForwardingComponent } from '../@types/common';
export interface TimelineProps extends WithAsProps {
    /** The content of the component */
    children?: React.ReactNode;
    /** TimeLine content relative position  **/
    align?: 'left' | 'right' | 'alternate';
    /** Timeline endless **/
    endless?: boolean;
}
interface TimelineComponent extends RsRefForwardingComponent<'div', TimelineProps> {
    Item: typeof TimelineItem;
}
declare const Timeline: TimelineComponent;
export default Timeline;
